package com.cinewave.tv

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Message
import android.provider.Settings
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.JsPromptResult
import android.webkit.JsResult
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import androidx.webkit.WebViewAssetLoader
import java.io.ByteArrayInputStream
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.zip.GZIPInputStream

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var assetLoader: WebViewAssetLoader

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Keep screen on for TV viewing
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // Hide navigation and status bar for immersive TV experience
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        )

        assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView = WebView(this)
        setContentView(webView)

        setupWebView()
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html")
        handlePlaybackIntent(intent)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        handlePlaybackIntent(intent)
    }

    private fun handlePlaybackIntent(intent: Intent?) {
        val playId = intent?.getStringExtra("play_id") ?: return
        val playTitle = intent.getStringExtra("play_title") ?: "Title"
        val playType = intent.getStringExtra("play_type") ?: "movie"
        val isEpisodic = playType == "tv" || playType == "anime"
        val seasonParam = if (isEpisodic && intent.hasExtra("season")) intent.getIntExtra("season", 1).toString() else "undefined"
        val episodeParam = if (isEpisodic && intent.hasExtra("episode")) intent.getIntExtra("episode", 1).toString() else "undefined"
        val js = "try { if (window.cinewavePlay) { window.cinewavePlay('$playId', '$playTitle', '$playType', $seasonParam, $episodeParam); } } catch(e){}"
        webView.postDelayed({ webView.evaluateJavascript(js, null) }, 600)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.allowFileAccessFromFileURLs = true
        settings.allowUniversalAccessFromFileURLs = true
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false

        // Popup & multi-window controls: strictly disable popup spawning via onCreateWindow
        settings.javaScriptCanOpenWindowsAutomatically = false
        settings.setSupportMultipleWindows(true)

        // Normalize User-Agent: strip '; wv)' and 'Version/4.0' to prevent Cloudflare Turnstile bot challenges
        val defaultUa = settings.userAgentString ?: ""
        val sanitizedUa = defaultUa
            .replace("; wv)", ")")
            .replace("; wv", "")
            .replace("Version/4.0 ", "")
        settings.userAgentString = sanitizedUa
        Log.i("CineWaveWebView", "Sanitized User-Agent: $sanitizedUa")

        android.webkit.CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(webView, true)
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                super.onPageStarted(view, url, favicon)
                val js = "try{let _d=window.location.hostname;Object.defineProperty(document,'domain',{get:()=>_d,set:v=>{_d=v;return _d;},configurable:true});}catch(e){}"
                view?.evaluateJavascript(js, null)
            }

            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: WebResourceRequest
            ): Boolean {
                return handleUrlOverride(view, request.url, request.isForMainFrame)
            }

            @Deprecated("Deprecated in Java")
            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                return handleUrlOverride(view, Uri.parse(url), true)
            }

            override fun onRenderProcessGone(view: WebView?, detail: RenderProcessGoneDetail?): Boolean {
                Log.w("NetflixTV", "WebView render process gone! Crashed: ${detail?.didCrash()}")
                try {
                    (view?.parent as? ViewGroup)?.removeView(view)
                    view?.destroy()
                } catch (e: Exception) {
                    Log.e("NetflixTV", "Error cleaning up webview on render process gone", e)
                }
                recreate()
                return true
            }

            override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                super.onReceivedError(view, errorCode, description, failingUrl)
                Log.w("NetflixTV", "WebView client error: $errorCode - $description for $failingUrl")
            }

            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? {
                val url = request.url

                // 1. Local HTML / JS / CSS assets
                if (url.path?.startsWith("/assets/") == true) {
                    return assetLoader.shouldInterceptRequest(url)
                }

                // 2. Intercept API calls to eliminate CORS & Mixed Content
                if (url.path?.startsWith("/api/") == true) {
                    return proxyApiRequest(request)
                }

                // 3. Direct HLS media stream proxying for fprime (amnestyinternational / totallyacdn) and vidrock (concretemiracle / slowcloud / vercetti)
                val streamHost = url.host?.lowercase() ?: ""
                val isAmnestyStream = streamHost.contains("amnestyinternational.dev") ||
                    streamHost.contains("totallyacdn.cc") ||
                    (streamHost.contains("hybrows.workers.dev") && url.query?.contains("amnestyinternational.dev") == true)
                val isVidrockStream = streamHost.contains("concretemiracle.lol") ||
                    streamHost.contains("slowcloud.live") ||
                    streamHost.contains("vercetti.org")

                if (isAmnestyStream || isVidrockStream) {
                    if (request.method.equals("OPTIONS", ignoreCase = true)) {
                        val headers = mutableMapOf<String, String>()
                        headers["Access-Control-Allow-Origin"] = "*"
                        headers["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS"
                        headers["Access-Control-Allow-Headers"] = "*"
                        return WebResourceResponse("text/plain", "UTF-8", 200, "OK", headers, ByteArrayInputStream(ByteArray(0)))
                    }

                    val rawTarget = if (url.query?.contains("url=") == true && url.query?.contains("amnestyinternational.dev") == true) {
                        url.getQueryParameter("url") ?: url.toString()
                    } else {
                        url.toString()
                    }
                    try {
                        val conn = URL(rawTarget).openConnection() as HttpURLConnection
                        conn.requestMethod = "GET"
                        conn.connectTimeout = 6000
                        conn.readTimeout = 12000
                        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
                        if (isAmnestyStream) {
                            conn.setRequestProperty("Referer", "https://fprime.at/")
                            conn.setRequestProperty("Origin", "https://fprime.at")
                        } else {
                            conn.setRequestProperty("Referer", "https://vidrock.to/")
                            conn.setRequestProperty("Origin", "https://vidrock.to")
                        }
                        val range = request.requestHeaders["Range"]
                        if (range != null) {
                            conn.setRequestProperty("Range", range)
                        }
                        val status = conn.responseCode
                        if (status in 200..399) {
                            val mime = conn.contentType?.split(";")?.get(0)?.trim()
                                ?: if (rawTarget.contains(".m3u8")) "application/vnd.apple.mpegurl" else "video/mp2t"
                            val headers = mutableMapOf<String, String>()
                            headers["Access-Control-Allow-Origin"] = "*"
                            headers["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS"
                            headers["Access-Control-Allow-Headers"] = "*"
                            val contentRange = conn.getHeaderField("Content-Range")
                            if (contentRange != null) headers["Content-Range"] = contentRange
                            val acceptRanges = conn.getHeaderField("Accept-Ranges")
                            if (acceptRanges != null) headers["Accept-Ranges"] = acceptRanges
                            return WebResourceResponse(mime, "UTF-8", status, if (status == 206) "Partial Content" else "OK", headers, conn.inputStream)
                        }
                    } catch (e: Exception) {
                        Log.w("CineWaveProxy", "Failed to proxy stream ($streamHost): ${e.message}")
                    }
                }

                // 4. Intercept and block ad networks, tracking scripts, and popunders
                if (isAdOrBlockedUrl(url)) {
                    Log.d("CineWaveAdBlock", "Blocked ad resource request: $url")
                    return createEmptyResourceResponse()
                }

                // 5. Map dead player.autoembed.cc / player.moviesapi.vip to live player.autoembed.me, neutralizing anti-sandbox redirections
                if (url.host?.contains("player.autoembed.cc") == true ||
                    url.host?.contains("player.moviesapi.vip") == true ||
                    url.host?.contains("player.autoembed.me") == true) {
                    var path = url.path ?: ""
                    if (path.startsWith("/movie/") || path.startsWith("/tv/")) {
                        path = "/embed$path"
                    }
                    if (path.contains("asb.html")) {
                        return createEmptyResourceResponse()
                    }
                    val pathAndQuery = path + if (url.query != null) "?${url.query}" else ""
                    val liveUrl = "https://player.autoembed.me$pathAndQuery"
                    try {
                        val conn = URL(liveUrl).openConnection() as HttpURLConnection
                        conn.requestMethod = "GET"
                        conn.connectTimeout = 4000
                        conn.readTimeout = 8000
                        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
                        val status = conn.responseCode
                        if (status in 200..399) {
                            val mime = conn.contentType?.split(";")?.get(0)?.trim() ?: "text/html"
                            val headers = mutableMapOf<String, String>()
                            headers["Access-Control-Allow-Origin"] = "*"
                            val stream = if (mime.contains("html", ignoreCase = true)) {
                                val rawHtml = conn.inputStream.bufferedReader().use { it.readText() }
                                val neutralizedHtml = neutralizeHtml(rawHtml)
                                neutralizedHtml.byteInputStream(Charsets.UTF_8)
                            } else {
                                conn.inputStream
                            }
                            return WebResourceResponse(mime, "UTF-8", status, "OK", headers, stream)
                        }
                    } catch (e: Exception) {
                        Log.w("CineWaveProxy", "Failed to forward autoembed: ${e.message}")
                    }
                }

                // 6. Intercept 2embed / framextv / vidsrc embed HTML to neutralize anti-sandbox and suppress ad modals
                if (url.host?.contains("2embed.cc") == true ||
                    url.host?.contains("framextv.cc") == true ||
                    url.host?.contains("vidsrc.to") == true) {
                    try {
                        val conn = URL(url.toString()).openConnection() as HttpURLConnection
                        conn.requestMethod = "GET"
                        conn.connectTimeout = 4000
                        conn.readTimeout = 8000
                        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
                        conn.setRequestProperty("Referer", "https://appassets.androidplatform.net/")
                        val status = conn.responseCode
                        if (status in 200..399) {
                            val mime = conn.contentType?.split(";")?.get(0)?.trim() ?: "text/html"
                            if (mime.contains("html", ignoreCase = true)) {
                                val rawHtml = conn.inputStream.bufferedReader().use { it.readText() }
                                val headers = mutableMapOf<String, String>()
                                headers["Access-Control-Allow-Origin"] = "*"
                                val neutralizedHtml = neutralizeHtml(rawHtml)
                                return WebResourceResponse(mime, "UTF-8", status, "OK", headers, neutralizedHtml.byteInputStream(Charsets.UTF_8))
                            }
                        }
                    } catch (e: Exception) {
                        Log.w("CineWaveProxy", "Failed to intercept embed HTML: ${e.message}")
                    }
                }

                return super.shouldInterceptRequest(view, request)
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                if (consoleMessage != null) {
                    Log.d("NetflixWeb", "[${consoleMessage.messageLevel()}] ${consoleMessage.message()} -- line ${consoleMessage.lineNumber()}")
                }
                return true
            }

            override fun onCreateWindow(
                view: WebView?,
                isDialog: Boolean,
                isUserGesture: Boolean,
                resultMsg: Message?
            ): Boolean {
                Log.w("CineWaveAdBlock", "Blocked popup window creation (isDialog=$isDialog, isUserGesture=$isUserGesture)")
                return false
            }

            override fun onJsAlert(
                view: WebView?,
                url: String?,
                message: String?,
                result: JsResult?
            ): Boolean {
                Log.d("CineWaveAdBlock", "Suppressed JS Alert from $url: $message")
                result?.confirm()
                return true
            }

            override fun onJsConfirm(
                view: WebView?,
                url: String?,
                message: String?,
                result: JsResult?
            ): Boolean {
                Log.d("CineWaveAdBlock", "Suppressed JS Confirm from $url: $message")
                result?.cancel()
                return true
            }

            override fun onJsPrompt(
                view: WebView?,
                url: String?,
                message: String?,
                defaultValue: String?,
                result: JsPromptResult?
            ): Boolean {
                Log.d("CineWaveAdBlock", "Suppressed JS Prompt from $url: $message")
                result?.cancel()
                return true
            }

            override fun onJsBeforeUnload(
                view: WebView?,
                url: String?,
                message: String?,
                result: JsResult?
            ): Boolean {
                Log.d("CineWaveAdBlock", "Suppressed JS BeforeUnload from $url: $message")
                result?.confirm()
                return true
            }
        }

        // Focus management
        webView.isFocusable = true
        webView.isFocusableInTouchMode = true
        webView.requestFocus()

        // Register in-app update bridge for Android TV / BlueStacks
        webView.addJavascriptInterface(AppUpdateBridge(this, webView), "AndroidUpdater")
    }

    private fun proxyApiRequest(request: WebResourceRequest): WebResourceResponse? {
        val url = request.url
        val pathAndQuery = url.path + if (url.query != null) "?${url.query}" else ""

        val isPlayback = url.path?.contains("/playback") == true
        val readTimeoutMs = if (isPlayback) 15000 else 5000
        val connectTimeoutMs = 2500

        // For local storage operations (watchlist / progress) when standalone, return immediate 200 OK
        if (pathAndQuery.contains("/users/me/") || pathAndQuery.contains("/settings")) {
            val emptyJson = "{\"success\":true,\"synced\":true}".toByteArray(Charsets.UTF_8)
            val headers = mutableMapOf<String, String>()
            headers["Access-Control-Allow-Origin"] = "*"
            headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            headers["Access-Control-Allow-Headers"] = "*"
            return WebResourceResponse(
                "application/json",
                "UTF-8",
                200,
                "OK",
                headers,
                ByteArrayInputStream(emptyJson)
            )
        }

        // Direct upstream failover targets for standalone APK execution
        val upstreamPath: String? = when {
            pathAndQuery.startsWith("/api/v1/catalog/category") || pathAndQuery.startsWith("/api/catalog/category") -> {
                val category = url.getQueryParameter("category")?.lowercase()
                    ?: url.getQueryParameter("c")?.lowercase()
                    ?: ""
                val genreId = url.getQueryParameter("genreId")
                    ?: url.getQueryParameter("genre")
                val page = url.getQueryParameter("page") ?: "1"

                when {
                    genreId != null && genreId.isNotEmpty() -> "/api/discover?genre=$genreId&page=$page"
                    category == "trending" -> "/api/trending?page=$page"
                    category == "popular_tv" || category == "tv" -> "/api/tv?page=$page"
                    category == "action" -> "/api/discover?genre=28&page=$page"
                    category == "comedy" -> "/api/discover?genre=35&page=$page"
                    category == "scifi" || category == "sci-fi" -> "/api/discover?genre=878&page=$page"
                    category == "thriller" -> "/api/discover?genre=53&page=$page"
                    category == "horror" -> "/api/discover?genre=27&page=$page"
                    category == "drama" -> "/api/discover?genre=18&page=$page"
                    category == "animation" -> "/api/discover?genre=16&page=$page"
                    category == "romance" -> "/api/discover?genre=10749&page=$page"
                    category == "crime" -> "/api/discover?genre=80&page=$page"
                    category == "adventure" -> "/api/discover?genre=12&page=$page"
                    category == "mystery" -> "/api/discover?genre=9648&page=$page"
                    category == "documentary" -> "/api/discover?genre=99&page=$page"
                    category == "family" -> "/api/discover?genre=10751&page=$page"
                    category == "fantasy" -> "/api/discover?genre=14&page=$page"
                    category == "history" -> "/api/discover?genre=36&page=$page"
                    category == "war" -> "/api/discover?genre=10752&page=$page"
                    category == "popular" || category == "popular_movies" || category == "movies" -> "/api/movies?page=$page"
                    else -> "/api/movies?page=$page"
                }
            }
            pathAndQuery.startsWith("/api/v1/catalog/search") -> pathAndQuery.replace("/api/v1/catalog/search", "/api/search")
            pathAndQuery.startsWith("/api/catalog/search") -> pathAndQuery.replace("/api/catalog/search", "/api/search")
            pathAndQuery.startsWith("/api/v1/catalog/home") -> pathAndQuery.replace("/api/v1/catalog/home", "/api/home")
            pathAndQuery.startsWith("/api/catalog/home") -> pathAndQuery.replace("/api/catalog/home", "/api/home")
            // Episode listing: /api/v1/titles/{id}/episodes?season={s} -> /api/season?id={id}&season={s}
            pathAndQuery.contains("/episodes") -> {
                val idMatch = Regex(".*/titles/([^/?]+)/episodes.*").find(pathAndQuery)
                val id = idMatch?.groupValues?.get(1) ?: ""
                val season = url.getQueryParameter("season") ?: "1"
                "/api/season?id=$id&season=$season"
            }
            // Title details: /api/v1/titles/{id}?type={type} -> /api/details?id={id}&type={type}
            pathAndQuery.matches(Regex(".*/titles/([^/?]+).*")) -> {
                val idMatch = Regex(".*/titles/([^/?]+).*").find(pathAndQuery)
                val id = idMatch?.groupValues?.get(1) ?: ""
                val type = url.getQueryParameter("type") ?: "movie"
                "/api/details?id=$id&type=$type"
            }
            pathAndQuery.startsWith("/api/v1/playback/resolve") -> pathAndQuery.replace("/api/v1/playback/resolve", "/api/stream").replace("contentId=", "id=")
            pathAndQuery.startsWith("/api/playback/resolve") -> pathAndQuery.replace("/api/playback/resolve", "/api/stream").replace("contentId=", "id=")
            pathAndQuery.startsWith("/api/stream") -> pathAndQuery.replace("contentId=", "id=")
            pathAndQuery.startsWith("/api/") -> pathAndQuery
            else -> null
        }

        val candidateTargets = mutableListOf<String>()
        // 1. Prioritize reliable live upstream endpoints to ensure zero latency on physical TV
        if (upstreamPath != null) {
            candidateTargets.add("https://api.framextv.tech$upstreamPath")
            candidateTargets.add("https://api.framextv.cc$upstreamPath")
            candidateTargets.add("https://api.framextv.pro$upstreamPath")
            candidateTargets.add("https://api.framextv.xyz$upstreamPath")
        }

        // 2. Emulator fallback gateway
        candidateTargets.add("http://10.0.2.2:8080$pathAndQuery")

        for (targetUrl in candidateTargets) {
            try {
                val conn = URL(targetUrl).openConnection() as HttpURLConnection
                conn.requestMethod = request.method
                conn.connectTimeout = connectTimeoutMs
                conn.readTimeout = readTimeoutMs

                // Forward request headers except Host and Accept-Encoding so HttpURLConnection manages decompression
                request.requestHeaders?.forEach { (k, v) ->
                    if (!k.equals("Host", ignoreCase = true) && !k.equals("Accept-Encoding", ignoreCase = true)) {
                        conn.setRequestProperty(k, v)
                    }
                }

                val status = conn.responseCode
                if (status in 200..499) {
                    val rawStream: InputStream = if (status in 200..299) {
                        conn.inputStream
                    } else {
                        conn.errorStream ?: ByteArrayInputStream(ByteArray(0))
                    }

                    val encoding = conn.contentEncoding
                    val decompressedStream: InputStream = if ("gzip".equals(encoding, ignoreCase = true)) {
                        GZIPInputStream(rawStream)
                    } else {
                        rawStream
                    }

                    val rawContentType = conn.contentType ?: "application/json"
                    val mimeType = rawContentType.split(";")[0].trim()

                    val headers = mutableMapOf<String, String>()
                    headers["Access-Control-Allow-Origin"] = "*"
                    headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
                    headers["Access-Control-Allow-Headers"] = "*"
                    headers["Content-Type"] = "application/json; charset=utf-8"

                    return WebResourceResponse(
                        mimeType,
                        "UTF-8",
                        status,
                        conn.responseMessage ?: "OK",
                        headers,
                        decompressedStream
                    )
                }
            } catch (e: Exception) {
                Log.w("CineWaveProxy", "Candidate $targetUrl failed: ${e.message}")
            }
        }
        return null
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        val keyString = when (event.keyCode) {
            KeyEvent.KEYCODE_DPAD_UP -> "ArrowUp"
            KeyEvent.KEYCODE_DPAD_DOWN -> "ArrowDown"
            KeyEvent.KEYCODE_DPAD_LEFT -> "ArrowLeft"
            KeyEvent.KEYCODE_DPAD_RIGHT -> "ArrowRight"
            KeyEvent.KEYCODE_DPAD_CENTER,
            KeyEvent.KEYCODE_ENTER,
            KeyEvent.KEYCODE_NUMPAD_ENTER,
            KeyEvent.KEYCODE_BUTTON_A,
            KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE,
            KeyEvent.KEYCODE_MEDIA_PLAY,
            KeyEvent.KEYCODE_MEDIA_PAUSE -> "Enter"
            KeyEvent.KEYCODE_BACK,
            KeyEvent.KEYCODE_ESCAPE,
            KeyEvent.KEYCODE_BUTTON_B -> "Escape"
            KeyEvent.KEYCODE_MEDIA_FAST_FORWARD -> "ArrowRight"
            KeyEvent.KEYCODE_MEDIA_REWIND -> "ArrowLeft"
            else -> null
        }

        if (keyString != null) {
            if (event.action == KeyEvent.ACTION_DOWN) {
                val js = "try { if (window.handleTvKeyEvent) { window.handleTvKeyEvent('$keyString'); } else { window.dispatchEvent(new KeyboardEvent('keydown', { key: '$keyString', code: '$keyString', bubbles: true, cancelable: true })); } } catch(e){}"
                webView.post {
                    try {
                        webView.evaluateJavascript(js, null)
                    } catch (e: Exception) {
                        Log.w("NetflixKey", "Key dispatch failed: ${e.message}")
                    }
                }
            }
            return true
        }
        return super.dispatchKeyEvent(event)
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
        webView.pauseTimers()
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
        webView.resumeTimers()
    }

    override fun onDestroy() {
        try {
            (webView.parent as? ViewGroup)?.removeView(webView)
            webView.stopLoading()
            webView.loadUrl("about:blank")
            webView.clearHistory()
            webView.removeAllViews()
            webView.destroy()
        } catch (e: Exception) {
            Log.e("NetflixTV", "Error destroying webview", e)
        }
        super.onDestroy()
    }

    private fun handleUrlOverride(view: WebView, uri: Uri?, isForMainFrame: Boolean): Boolean {
        if (uri == null) return false
        val urlStr = uri.toString()
        val scheme = uri.scheme?.lowercase()
        val host = uri.host?.lowercase() ?: ""

        // 1. Always allow local app assets
        if (urlStr.startsWith("https://appassets.androidplatform.net/") ||
            host == "appassets.androidplatform.net"
        ) {
            return false
        }

        // 2. Block non-http/https schemes (e.g. market://, intent://, itms-apps://)
        if (scheme != "http" && scheme != "https") {
            Log.w("CineWaveAdBlock", "Blocked external custom scheme: $urlStr")
            return true
        }

        // 3. Protect main application frame from top-level hijacking/redirects
        if (isForMainFrame) {
            Log.w("CineWaveAdBlock", "Blocked main frame navigation to external URL: $urlStr")
            return true
        }

        // 4. In subframes: only allow navigations to verified streaming hosts; block all external ad redirects
        val isAllowedStreamingHost = host.contains("framextv") ||
            host.contains("autoembed") ||
            host.contains("vidlink") ||
            host.contains("smashystream") ||
            host.contains("anyembed") ||
            host.contains("vidsrc") ||
            host.contains("2embed") ||
            host.contains("moviesapi") ||
            host.contains("multiembed") ||
            host.contains("themoviedb.org") ||
            host.contains("tmdb.org") ||
            host.contains("hscow.com") ||
            host.contains("strem.io") ||
            host.contains("rezesubs.com") ||
            host.contains("amnestyinternational.dev") ||
            host.contains("totallyacdn.cc") ||
            host.contains("slowcloud.live") ||
            host.contains("hybrows.workers.dev") ||
            host.contains("cloudflare") ||
            host.contains("gstatic.com") ||
            host.contains("googleapis.com")

        if (!isAllowedStreamingHost || isAdOrBlockedUrl(uri)) {
            Log.w("CineWaveAdBlock", "Blocked subframe external/ad redirect: $urlStr")
            return true
        }

        // Allow legitimate subframe navigations (e.g. video embed players/CDNs)
        return false
    }

    private fun neutralizeHtml(rawHtml: String): String {
        val antiSandboxScript = "<script>try{let _d=window.location.hostname;Object.defineProperty(document,'domain',{get:()=>_d,set:v=>{_d=v;return _d;},configurable:true});}catch(e){}try{window.open=function(){return null;};window.alert=function(){};window.confirm=function(){return false;};}catch(e){}</script>"
        val antiAdStyle = "<style>#sbxErr, #asb, .ad-banner, .pop-under, .ad-overlay, [class*=\"advertisement\"], [id*=\"advertisement\"], a[href*=\"adplox.com\"], a[href*=\"bet\"], div[style*=\"z-index: 99999\"], div[style*=\"z-index: 2147483647\"], div[id*=\"gift\"], div[class*=\"gift\"], img[src*=\"gift\"], a[href*=\"gift\"], div[class*=\"floating\"], div[id*=\"ad\"], [class*=\"floating\"] { display: none !important; pointer-events: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; }</style>"

        var result = rawHtml
            .replace("<head>", "<head>$antiSandboxScript$antiAdStyle", ignoreCase = true)
            .replace("try{document.domain=document.domain}catch(t){r();return}", "")
            .replace("if(window.frameElement.hasAttribute(\"sandbox\")){r()}", "")
            .replace("if(window.frameElement.hasAttribute('sandbox')){r()}", "")
            .replace("isReallySandboxed()", "false")
            .replace("/asb.html", "/disabled_asb.html")
            .replace("if(s){die();throw'';}", "// neutralized anti-sandbox")

        // Strip autoembed anti-sandbox scripts and casino ad generation scripts
        result = result.replace(Regex("<script[^>]*>[\\s\\S]*?asb\\.html[\\s\\S]*?</script>", RegexOption.IGNORE_CASE), "")
        result = result.replace(Regex("<script[^>]*>[\\s\\S]*?var die=function[\\s\\S]*?</script>", RegexOption.IGNORE_CASE), "")
        result = result.replace(Regex("<script[^>]*>[\\s\\S]*?ad_slot[\\s\\S]*?</script>", RegexOption.IGNORE_CASE), "")
        result = result.replace(Regex("<script[^>]*>[\\s\\S]*?window\\.frameElement[\\s\\S]*?</script>", RegexOption.IGNORE_CASE), "")

        // Strip soycdn, __ads, tagivi, createlouisville, histats scripts
        result = result.replace(Regex("<script[^>]*soycdn[\\s\\S]*?</script>", RegexOption.IGNORE_CASE), "")
        result = result.replace(Regex("<script[^>]*__ads[\\s\\S]*?</script>", RegexOption.IGNORE_CASE), "")
        result = result.replace(Regex("<script[^>]*createlouisville[\\s\\S]*?</script>", RegexOption.IGNORE_CASE), "")
        result = result.replace(Regex("<script[^>]*tagivi[\\s\\S]*?</script>", RegexOption.IGNORE_CASE), "")
        result = result.replace(Regex("<script[^>]*histats[\\s\\S]*?</script>", RegexOption.IGNORE_CASE), "")
        result = result.replace(Regex("<script>\\(function\\(\\)\\{function r\\(\\)\\{[\\s\\S]*?window\\.location\\.href=u[\\s\\S]*?\\}\\)\\(\\);</script>", RegexOption.IGNORE_CASE), "")

        return result
    }

    private fun createEmptyResourceResponse(): WebResourceResponse {
        val emptyBytes = ByteArray(0)
        val headers = mutableMapOf<String, String>()
        headers["Access-Control-Allow-Origin"] = "*"
        headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        headers["Pragma"] = "no-cache"
        headers["Expires"] = "0"
        return WebResourceResponse(
            "text/plain",
            "UTF-8",
            200,
            "OK",
            headers,
            ByteArrayInputStream(emptyBytes)
        )
    }

    private fun isAdOrBlockedUrl(uri: Uri): Boolean {
        val host = uri.host?.lowercase() ?: return false
        val urlStr = uri.toString().lowercase()
        val path = uri.path?.lowercase() ?: ""

        // Explicitly block turnstile challenges, robot verification, and anti-sandbox redirects
        if (host.contains("turnstile") || urlStr.contains("turnstile") ||
            urlStr.contains("challenges.cloudflare.com") ||
            host.contains("streamingnow.mov") ||
            path.contains("asb.html") ||
            urlStr.contains("asb.html")
        ) {
            return true
        }

        // Explicitly block ad injection scripts, soycdn, and popup widgets
        if (host.contains("soycdn") ||
            host.contains("createlouisville") ||
            host.contains("tagivi") ||
            host.contains("histats") ||
            host.contains("profiton") ||
            path.contains("/__ads") ||
            path.contains("/ads/") ||
            urlStr.contains("/__ads/") ||
            urlStr.contains("vidsrcto.js") ||
            urlStr.contains("ad.js")
        ) {
            return true
        }

        // Whitelist app assets, internal endpoints, and verified embed & streaming providers
        if (host == "appassets.androidplatform.net" ||
            host.contains("framextv") ||
            host.contains("autoembed") ||
            host.contains("vidlink") ||
            host.contains("smashystream") ||
            host.contains("anyembed") ||
            host.contains("vidsrc") ||
            host.contains("2embed") ||
            host.contains("moviesapi") ||
            host.contains("multiembed") ||
            host.contains("themoviedb.org") ||
            host.contains("tmdb.org") ||
            host.contains("hscow.com") ||
            host.contains("strem.io") ||
            host.contains("rezesubs.com") ||
            host.contains("amnestyinternational.dev") ||
            host.contains("totallyacdn.cc") ||
            host.contains("slowcloud.live") ||
            host.contains("hybrows.workers.dev")
        ) {
            return false
        }

        return BLOCKED_HOST_PATTERNS.any { pattern -> host.contains(pattern) || urlStr.contains(pattern) }
    }

    companion object {
        private val BLOCKED_HOST_PATTERNS = listOf(
            "adplox",
            "whos.amung.us",
            "recaptcha",
            "google.com/recaptcha",
            "popads",
            "popcash",
            "adsterra",
            "propellerads",
            "exoclick",
            "hilltopads",
            "monetag",
            "onclickalgo",
            "onclickperformance",
            "clickadu",
            "ad-delivery",
            "admaven",
            "doubleclick",
            "googlesyndication",
            "google-analytics",
            "adnxs",
            "adxpose",
            "moatads",
            "criteo",
            "outbrain",
            "taboola",
            "trafficfactory",
            "juicyads",
            "ero-advertising",
            "tsyndicate",
            "adfox",
            "aniview",
            "spotxchange",
            "springserve",
            "vlitag",
            "vidazoo",
            "yieldmo",
            "revcontent",
            "mgid",
            "adskeeper",
            "richaudience",
            "teads",
            "poringasitia",
            "streamingnow.mov",
            "multiembed",
            "histats",
            "soycdn",
            "createlouisville",
            "tagivi",
            "profiton",
            "asb.html",
            "popunder",
            "gift",
            "realsrv",
            "syndication",
            "serving-sys",
            "creativecdn",
            "adroll",
            "rubiconproject",
            "pubmatic",
            "openx",
            "smartadserver",
            "casalemedia",
            "inmobi",
            "chartboost",
            "applovin",
            "unityads",
            "vungle",
            "ironsource",
            "tapjoy",
            "adcolony",
            "fyber",
            "betway",
            "dafabet",
            "bet365",
            "1xbet",
            "mostbet",
            "melbet",
            "parimatch"
        )
    }
}

/**
 * JavaScript Interface Bridge for checking, downloading, and launching APK updates on Android TV.
 */
class AppUpdateBridge(private val activity: MainActivity, private val webView: WebView) {

    @JavascriptInterface
    fun isAndroidApp(): Boolean = true

    @JavascriptInterface
    fun getAppVersionCode(): Int {
        return try {
            val pInfo = activity.packageManager.getPackageInfo(activity.packageName, 0)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                pInfo.longVersionCode.toInt()
            } else {
                @Suppress("DEPRECATION")
                pInfo.versionCode
            }
        } catch (e: Exception) {
            1
        }
    }

    @JavascriptInterface
    fun getAppVersionName(): String {
        return try {
            val pInfo = activity.packageManager.getPackageInfo(activity.packageName, 0)
            pInfo.versionName ?: "1.0.0"
        } catch (e: Exception) {
            "1.0.0"
        }
    }

    @JavascriptInterface
    fun downloadAndInstallApk(apkUrl: String) {
        Log.d("NetflixUpdater", "Initiating APK download from: $apkUrl")

        // Prompt for unknown sources permission on Android 8.0+ if not already granted
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (!activity.packageManager.canRequestPackageInstalls()) {
                Log.w("NetflixUpdater", "REQUEST_INSTALL_PACKAGES not granted, opening system settings")
                try {
                    val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                        data = Uri.parse("package:${activity.packageName}")
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    activity.startActivity(intent)
                } catch (e: Exception) {
                    Log.e("NetflixUpdater", "Failed to launch unknown sources settings", e)
                }
            }
        }

        Thread {
            try {
                notifyProgress(0, "downloading")

                val url = URL(apkUrl)
                val conn = url.openConnection() as HttpURLConnection
                conn.connectTimeout = 15000
                conn.readTimeout = 45000
                conn.instanceFollowRedirects = true
                conn.connect()

                val status = conn.responseCode
                if (status !in 200..299) {
                    notifyProgress(-1, "error: HTTP $status")
                    return@Thread
                }

                val contentLength = conn.contentLength
                val cacheDir = activity.cacheDir
                val apkFile = File(cacheDir, "Netflix-Update.apk")
                if (apkFile.exists()) {
                    apkFile.delete()
                }

                val input: InputStream = conn.inputStream
                val output = FileOutputStream(apkFile)

                val buffer = ByteArray(8192)
                var bytesRead: Int
                var totalBytes: Long = 0
                var lastReportedPercent = -1

                while (input.read(buffer).also { bytesRead = it } != -1) {
                    output.write(buffer, 0, bytesRead)
                    totalBytes += bytesRead
                    if (contentLength > 0) {
                        val percent = ((totalBytes * 100) / contentLength).toInt()
                        if (percent != lastReportedPercent) {
                            lastReportedPercent = percent
                            notifyProgress(percent, "downloading")
                        }
                    }
                }

                output.flush()
                output.close()
                input.close()
                conn.disconnect()

                notifyProgress(100, "ready_to_install")

                // Launch package installer intent on main thread
                activity.runOnUiThread {
                    try {
                        val apkUri = FileProvider.getUriForFile(
                            activity,
                            "${activity.packageName}.fileprovider",
                            apkFile
                        )
                        val installIntent = Intent(Intent.ACTION_VIEW).apply {
                            setDataAndType(apkUri, "application/vnd.android.package-archive")
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
                        }
                        activity.startActivity(installIntent)
                        notifyProgress(100, "installed_prompted")
                    } catch (e: Exception) {
                        Log.e("NetflixUpdater", "Failed to start install intent", e)
                        notifyProgress(-1, "error: ${e.message}")
                    }
                }
            } catch (e: Exception) {
                Log.e("NetflixUpdater", "Error during APK download", e)
                notifyProgress(-1, "error: ${e.message}")
            }
        }.start()
    }

    private fun notifyProgress(percent: Int, status: String) {
        val js = "try { if (window.onUpdateDownloadProgress) { window.onUpdateDownloadProgress($percent, '$status'); } } catch(e){}"
        activity.runOnUiThread {
            webView.evaluateJavascript(js, null)
        }
    }
}
