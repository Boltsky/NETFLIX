package com.cinewave.tv

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.net.http.SslError
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
import android.webkit.SslErrorHandler
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

        WebView.setWebContentsDebuggingEnabled(false)

        android.webkit.CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(webView, true)
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                super.onPageStarted(view, url, favicon)
                val js = "try{Object.defineProperty(window,'top',{get:function(){return window.self;},configurable:true});}catch(e){}" +
                    "try{let _d=window.location.hostname;Object.defineProperty(document,'domain',{get:()=>_d,set:v=>{_d=v;return _d;},configurable:true});}catch(e){}" +
                    "try{if(window.PluginArray&&window.PluginArray.prototype)PluginArray.prototype.namedItem=function(){return null;};}catch(e){}" +
                    "try{window.DisableDevtool={isRunning:false,isDevToolOpened:function(){return false;},stop:function(){}};Object.defineProperty(window,'DisableDevtool',{get:function(){return{isRunning:false,isDevToolOpened:function(){return false;},stop:function(){}};},configurable:true});}catch(e){}"
                view?.evaluateJavascript(js, null)
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                val antiAdJs = """
                    (function() {
                        try {
                            const css = '#sbxErr, #asb, .ad-banner, .pop-under, .ad-overlay, [class*="advertisement"], [id*="advertisement"], a[href*="adplox.com"], a[href*="bet"], div[style*="z-index: 99999"], div[style*="z-index: 2147483647"], div[id*="gift"], div[class*="gift"], img[src*="gift"], a[href*="gift"], div[class*="floating"], div[id*="ad"], [class*="floating"], div[class*="bonus"], div[id*="bonus"], [class*="casino"], [id*="casino"], [class*="claim"], [id*="claim"], [class*="wheel"], [id*="wheel"], [class*="reward"], [id*="reward"], div[class*="recaptcha"], iframe[src*="recaptcha"], div[class*="cf-turnstile"], iframe[src*="turnstile"], div[id*="turnstile"] { display: none !important; pointer-events: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; }';
                            let s = document.getElementById('cinewave-anti-ad');
                            if (!s) {
                                s = document.createElement('style');
                                s.id = 'cinewave-anti-ad';
                                s.textContent = css;
                                (document.head || document.documentElement).appendChild(s);
                            }
                        } catch(e) {}
                    })();
                """.trimIndent()
                view?.evaluateJavascript(antiAdJs, null)
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

            override fun onReceivedSslError(view: WebView?, handler: SslErrorHandler?, error: SslError?) {
                Log.w("CineWaveSSL", "Bypassing SSL error (${error?.primaryError}) for ${error?.url}")
                handler?.proceed()
            }

            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? {
                val url = request.url
                val isLocalApp = url.host == "appassets.androidplatform.net"

                // 1. Local HTML / JS / CSS assets
                if (isLocalApp && url.path?.startsWith("/assets/") == true) {
                    return assetLoader.shouldInterceptRequest(url)
                }

                // 2. Intercept API calls to eliminate CORS & Mixed Content
                if (isLocalApp && url.path?.startsWith("/api/") == true) {
                    return proxyApiRequest(request)
                }

                // 2b. Intercept FrameX API calls natively to bypass CORS
                if (url.host?.contains("framextv") == true && url.path?.startsWith("/api/") == true) {
                    try {
                        val conn = URL(url.toString()).openConnection() as HttpURLConnection
                        conn.requestMethod = request.method ?: "GET"
                        conn.connectTimeout = 8000
                        conn.readTimeout = 15000
                        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
                        conn.setRequestProperty("Accept", "application/json")
                        conn.setRequestProperty("Referer", "https://framextv.cc/")
                        conn.setRequestProperty("Origin", "https://framextv.cc")
                        conn.setRequestProperty("Accept-Encoding", "gzip, deflate")
                        val status = conn.responseCode
                        val rawStream = try {
                            if (status in 200..399) conn.inputStream else (conn.errorStream ?: ByteArrayInputStream(ByteArray(0)))
                        } catch (_: Exception) {
                            conn.errorStream ?: ByteArrayInputStream(ByteArray(0))
                        }
                        val encoding = conn.contentEncoding?.lowercase() ?: ""
                        val stream = if (encoding.contains("gzip")) {
                            java.util.zip.GZIPInputStream(rawStream)
                        } else {
                            rawStream
                        }
                        val headers = mutableMapOf<String, String>()
                        headers["Access-Control-Allow-Origin"] = "*"
                        headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
                        headers["Access-Control-Allow-Headers"] = "*"
                        return WebResourceResponse("application/json", "UTF-8", status, "OK", headers, stream)
                    } catch (e: Exception) {
                        Log.w("CineWaveProxy", "Failed to proxy FrameX API: ${e.message}")
                    }
                }

                // 3. Intercept dead stream hosts (atlantic.st, classroom.best, disable-devtool, theajack) with instant failover payload
                val host = url.host?.lowercase() ?: ""
                val path = url.path?.lowercase() ?: ""
                val rawUrlStr = url.toString().lowercase()

                if (host.contains("atlantic.st") || rawUrlStr.contains("atlantic.st") ||
                    host.contains("classroom.best") || rawUrlStr.contains("classroom.best") ||
                    host.contains("theajack.github.io") || rawUrlStr.contains("disable-devtool") ||
                    rawUrlStr.contains("404.html?h=")
                ) {
                    Log.w("CineWaveProxy", "Intercepted dead stream host ($host), emitting immediate warning_slide failover payload")
                    val failoverHtml = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head><body style=\"background:#000;color:#fff\"><script>(function(){" +
                        "var p={type:'warning_slide',event:'warning_slide',currentTime:0,duration:0,playing:false,src:window.location.href};" +
                        "try{if(window.parent&&window.parent!==window)window.parent.postMessage(p,'*');}catch(e){}" +
                        "try{if(window.top&&window.top!==window.parent&&window.top!==window)window.top.postMessage(p,'*');}catch(e){}" +
                        "})();</script></body></html>"
                    val headers = mutableMapOf<String, String>()
                    headers["Access-Control-Allow-Origin"] = "*"
                    return WebResourceResponse("text/html", "UTF-8", 200, "OK", headers, failoverHtml.byteInputStream(Charsets.UTF_8))
                }

                // 4. Intercept and block ad networks, tracking scripts, popunders, and rogue domains
                if (isAdOrBlockedUrl(url)) {
                    Log.d("CineWaveAdBlock", "Blocked ad or rogue resource request: $url")
                    return createEmptyResourceResponse()
                }

                // 5. Direct media stream proxying with CORS unblocking (vidrock, themoviebox proxy unwrapping, bcdnw, hakunaymatata, slowcloud)
                val streamHost = url.host?.lowercase() ?: ""
                val streamPath = url.path?.lowercase() ?: ""
                val isTheMovieBoxProxy = streamHost.contains("themoviebox.uk") && streamPath.contains("/proxy")
                val isMediaStream = streamHost.contains("concretemiracle.lol") ||
                    streamHost.contains("slowcloud.live") ||
                    streamHost.contains("vercetti.org") ||
                    streamHost.contains("hakunaymatata.com") ||
                    streamHost.contains("videodownloader.site") ||
                    isTheMovieBoxProxy ||
                    streamPath.endsWith(".mp4") ||
                    streamPath.endsWith(".m3u8") ||
                    streamPath.endsWith(".ts")

                if (isMediaStream) {
                    if (request.method.equals("OPTIONS", ignoreCase = true)) {
                        val headers = mutableMapOf<String, String>()
                        headers["Access-Control-Allow-Origin"] = "*"
                        headers["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS"
                        headers["Access-Control-Allow-Headers"] = "*"
                        return WebResourceResponse("text/plain", "UTF-8", 200, "OK", headers, ByteArrayInputStream(ByteArray(0)))
                    }

                    // For themoviebox.uk/proxy?url=...&referer=..., unwrap directly to the underlying CDN stream
                    val effectiveTarget = if (isTheMovieBoxProxy && !url.getQueryParameter("url").isNullOrEmpty()) {
                        url.getQueryParameter("url")!!
                    } else {
                        url.toString()
                    }

                    val queryReferer = if (isTheMovieBoxProxy) url.getQueryParameter("referer") else null

                    val isHead = request.method.equals("HEAD", ignoreCase = true)
                    try {
                        val conn = URL(effectiveTarget).openConnection() as HttpURLConnection
                        conn.requestMethod = if (isHead) "HEAD" else "GET"
                        conn.connectTimeout = 8000
                        conn.readTimeout = 15000
                        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")

                        val clientReferer = request.requestHeaders?.entries?.firstOrNull { it.key.equals("Referer", ignoreCase = true) }?.value
                        val streamReferer = when {
                            !queryReferer.isNullOrEmpty() -> queryReferer
                            effectiveTarget.contains("hakunaymatata.com") -> "https://videodownloader.site/"
                            effectiveTarget.contains("vidrock.to") || streamHost.contains("concretemiracle.lol") || streamHost.contains("slowcloud.live") || streamHost.contains("vercetti.org") -> "https://vidrock.to/"
                            !clientReferer.isNullOrEmpty() && !clientReferer.contains("androidplatform.net") -> clientReferer
                            else -> "https://${URL(effectiveTarget).host}/"
                        }
                        conn.setRequestProperty("Referer", streamReferer)

                        val range = request.requestHeaders?.get("Range") ?: request.requestHeaders?.entries?.firstOrNull { it.key.equals("Range", ignoreCase = true) }?.value
                        if (range != null) {
                            conn.setRequestProperty("Range", range)
                        }

                        val status = conn.responseCode
                        if (status in 200..399) {
                            val mime = conn.contentType?.split(";")?.get(0)?.trim()
                                ?: if (effectiveTarget.contains(".m3u8")) "application/vnd.apple.mpegurl" else if (effectiveTarget.contains(".mp4")) "video/mp4" else "video/mp2t"
                            val clientOrigin = request.requestHeaders?.entries?.firstOrNull { it.key.equals("Origin", ignoreCase = true) }?.value ?: "*"
                            val headers = mutableMapOf<String, String>()
                            headers["Access-Control-Allow-Origin"] = clientOrigin
                            headers["Access-Control-Allow-Credentials"] = "true"
                            headers["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS"
                            headers["Access-Control-Allow-Headers"] = "*"
                            headers["Access-Control-Expose-Headers"] = "Content-Range, Accept-Ranges, Content-Length, Content-Type, Date, Server"
                            val contentRange = conn.getHeaderField("Content-Range")
                            if (contentRange != null) headers["Content-Range"] = contentRange
                            val acceptRanges = conn.getHeaderField("Accept-Ranges")
                            if (acceptRanges != null) headers["Accept-Ranges"] = acceptRanges
                            val contentLength = conn.getHeaderField("Content-Length")
                            if (contentLength != null) headers["Content-Length"] = contentLength

                            val bodyStream = if (isHead) ByteArrayInputStream(ByteArray(0)) else conn.inputStream
                            // Crucial: encoding MUST be null for binary video/audio streams so Chromium avoids UTF-8 corruption
                            return WebResourceResponse(mime, null, status, if (status == 206) "Partial Content" else "OK", headers, bodyStream)
                        }
                    } catch (e: Exception) {
                        Log.w("CineWaveProxy", "Direct media proxy failed for $effectiveTarget: ${e.message}")
                    }
                    return createEmptyResourceResponse()
                }

                // 6. Map dead player.autoembed.cc / player.moviesapi.vip / player.autoembed.me to live vidlink.pro, neutralizing anti-sandbox redirections
                if (url.host?.contains("player.autoembed.cc") == true ||
                    url.host?.contains("player.moviesapi.vip") == true ||
                    url.host?.contains("player.autoembed.me") == true) {
                    val isTv = path.contains("/tv/")
                    val idMatch = Regex(".*/(?:movie|tv)/([^/?]+).*").find(path)
                    val id = idMatch?.groupValues?.get(1) ?: ""
                    if (id.isNotEmpty()) {
                        val targetUrl = if (isTv) {
                            val seasonMatch = Regex(".*/tv/[^/?]+/([^/?]+)/([^/?]+).*").find(path)
                            val s = seasonMatch?.groupValues?.get(1) ?: "1"
                            val ep = seasonMatch?.groupValues?.get(2) ?: "1"
                            "https://vidlink.pro/tv/$id/$s/$ep?primaryColor=e50914&autoplay=true"
                        } else {
                            "https://vidlink.pro/movie/$id?primaryColor=e50914&autoplay=true"
                        }
                        val redirectHtml = "<!DOCTYPE html><html><head><meta http-equiv=\"refresh\" content=\"0;url=$targetUrl\"></head><body style=\"margin:0;background:#000\"><script>window.location.replace('$targetUrl');</script></body></html>"
                        val headers = mutableMapOf<String, String>()
                        headers["Access-Control-Allow-Origin"] = "*"
                        return WebResourceResponse("text/html", "UTF-8", 200, "OK", headers, redirectHtml.byteInputStream(Charsets.UTF_8))
                    }
                    return createEmptyResourceResponse()
                }

                // 7. Universal Interception of external HTML embed documents and subframes to neutralize anti-sandbox and inject telemetry
                val isLocalHost = host.contains("androidplatform.net") || host.contains("localhost") || host == "127.0.0.1"
                val isStaticMedia = path.endsWith(".css") || path.endsWith(".png") || path.endsWith(".jpg") ||
                    path.endsWith(".jpeg") || path.endsWith(".gif") || path.endsWith(".webp") || path.endsWith(".svg") ||
                    path.endsWith(".ico") || path.endsWith(".woff") || path.endsWith(".woff2") || path.endsWith(".ttf") ||
                    path.endsWith(".mp4") || path.endsWith(".m3u8") || path.endsWith(".ts") || path.endsWith(".mpd") ||
                    path.endsWith(".key") || path.endsWith(".json")
                val isJs = path.endsWith(".js")
                val isAsset = isJs || isStaticMedia || path.contains("/assets/") || path.contains("/_next/") || path.contains("/api/")

                val isExplicitHtml = path.endsWith(".html") || path.endsWith(".htm") || path.endsWith(".php")
                val acceptsHtml = request.requestHeaders?.get("Accept")?.contains("text/html", ignoreCase = true) == true
                val isEmbedHost = host.contains("framextv") || host.contains("vidup") || host.contains("vidbolt") ||
                    host.contains("multiembed") || host.contains("streamingnow") || host.contains("vidsrc") ||
                    host.contains("2embed") || host.contains("autoembed") || host.contains("vidlink")

                val isNextJsEmbed = host.contains("vidup") || host.contains("vidlink")

                val shouldInterceptHtml = !isLocalHost && !isAsset && !isMediaStream && !isNextJsEmbed && (
                    isExplicitHtml || acceptsHtml || isEmbedHost || !path.contains(".")
                )

                if (shouldInterceptHtml) {
                    try {
                        val conn = URL(url.toString()).openConnection() as HttpURLConnection
                        conn.requestMethod = "GET"
                        conn.connectTimeout = 8000
                        conn.readTimeout = 15000
                        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
                        conn.setRequestProperty("Accept-Encoding", "gzip, deflate")

                        val clientReferer = request.requestHeaders?.entries?.firstOrNull { it.key.equals("Referer", ignoreCase = true) }?.value
                        val effectiveReferer = when {
                            host.contains("vidbolt") || host.contains("vidup") -> "https://framextv.cc/"
                            host.contains("streamingnow.mov") || host.contains("multiembed.mov") -> "https://multiembed.mov/"
                            host.contains("vidsrc") -> "https://vidsrc.to/"
                            !clientReferer.isNullOrEmpty() && !clientReferer.contains("androidplatform.net") -> clientReferer
                            else -> "https://${url.host}/"
                        }
                        conn.setRequestProperty("Referer", effectiveReferer)
                        conn.setRequestProperty("Origin", effectiveReferer.trimEnd('/'))

                        val status = conn.responseCode
                        if (status in 200..399) {
                            val contentType = conn.contentType ?: "text/html"
                            val isJsContent = isJs || contentType.contains("javascript", ignoreCase = true)
                            val isHtmlContent = contentType.contains("html", ignoreCase = true) || (!isJsContent && !path.contains("."))

                            val rawStream = if (status in 200..399) conn.inputStream else (conn.errorStream ?: conn.inputStream)
                            val encoding = conn.contentEncoding?.lowercase() ?: ""
                            val stream = if (encoding.contains("gzip")) {
                                java.util.zip.GZIPInputStream(rawStream)
                            } else {
                                rawStream
                            }

                            if (isHtmlContent) {
                                val rawHtml = stream.bufferedReader(Charsets.UTF_8).use { it.readText() }
                                val headers = mutableMapOf<String, String>()
                                headers["Access-Control-Allow-Origin"] = "*"
                                val neutralizedHtml = neutralizeHtml(rawHtml)
                                return WebResourceResponse("text/html", "UTF-8", status, "OK", headers, neutralizedHtml.byteInputStream(Charsets.UTF_8))
                            } else if (isJsContent) {
                                val rawJs = stream.bufferedReader(Charsets.UTF_8).use { it.readText() }
                                val headers = mutableMapOf<String, String>()
                                headers["Access-Control-Allow-Origin"] = "*"
                                headers["Content-Type"] = "application/javascript; charset=UTF-8"
                                val neutralizedJs = neutralizeJs(rawJs)
                                return WebResourceResponse("application/javascript", "UTF-8", status, "OK", headers, neutralizedJs.byteInputStream(Charsets.UTF_8))
                            } else {
                                val mime = contentType.split(";")[0].trim()
                                return WebResourceResponse(mime, "UTF-8", status, "OK", emptyMap(), stream)
                            }
                        }
                    } catch (e: Exception) {
                        Log.w("CineWaveProxy", "Failed to intercept embed HTML/JS for $url: ${e.message}")
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
            host.contains("vidbolt") ||
            host.contains("vidup") ||
            host.contains("hakunaymatata") ||
            host.contains("johndoesdmc") ||
            host.contains("vidlink") ||
            host.contains("smashystream") ||
            host.contains("anyembed") ||
            host.contains("vidsrc") ||
            host.contains("2embed") ||
            host.contains("moviesapi") ||
            host.contains("multiembed") ||
            host.contains("streamingnow.mov") ||
            host.contains("enc-dec.app") ||
            host.contains("totallyacdn.cc") ||
            host.contains("fprime.at") ||
            host.contains("cinejoy.pk") ||
            host.contains("movy.sx") ||
            host.contains("videasy.to") ||
            host.contains("filmboom.top") ||
            host.contains("themoviedb.org") ||
            host.contains("tmdb.org") ||
            host.contains("hscow.com") ||
            host.contains("strem.io") ||
            host.contains("rezesubs.com") ||
            host.contains("slowcloud.live") ||
            host.contains("hybrows.workers.dev") ||
            host.contains("wsrv.nl") ||
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

    private fun neutralizeJs(rawJs: String): String {
        return rawJs
            .replace(Regex("let\\s+t\\s*=\\s*\\(\\)\\s*=>\\s*\\{[\\s\\S]*?Please Disable Sandbox[\\s\\S]*?\\};?"), "let t=()=>{return;};")
            .replace("document.body.innerHTML='<div style=\"display:flex;justify-content:center;align-items:center;height:100vh\"><h1>Please Disable Sandbox</h1></div>'", "/*noop*/")
            .replace("document.body.innerHTML='<div style=\"display:flex;justify-content:center;align-items:center;height:100vh;\"><h1>Please Disable Sandbox</h1></div>'", "/*noop*/")
            .replace("0,window.self!==window.top", "0,false")
            .replace("window.self!==window.top", "false")
            .replace("window.self !== window.top", "false")
            .replace("window.self!=window.top", "false")
            .replace("document.domain=document.domain", "/*domain*/")
            .replace("e.toString().toLowerCase().includes(\"sandbox\")", "false")
            .replace("e.toString().toLowerCase().includes('sandbox')", "false")
            .replace("return void t()", "return")
            .replace("return void t();", "return;")
            .replace("void t()", "void 0")
            .replace("e.onerror=()=>(t(),!0)", "e.onerror=()=>true")
            .replace("e.onerror=()=>t()", "e.onerror=()=>true")
            .replace("e.onerror=()=>{t()}", "e.onerror=()=>{}")
            .replace("e.onerror=function(){t()}", "e.onerror=function(){}")
            .replace("!window.navigator.plugins.namedItem(\"Chrome PDF Viewer\")", "true")
            .replace("!window.navigator.plugins.namedItem('Chrome PDF Viewer')", "true")
            .replace("!navigator.plugins.namedItem(\"Chrome PDF Viewer\")", "true")
            .replace("!navigator.plugins.namedItem('Chrome PDF Viewer')", "true")
            .replace("window.navigator.plugins.namedItem(\"Chrome PDF Viewer\")", "null")
            .replace("window.navigator.plugins.namedItem('Chrome PDF Viewer')", "null")
            .replace("navigator.plugins.namedItem(\"Chrome PDF Viewer\")", "null")
            .replace("navigator.plugins.namedItem('Chrome PDF Viewer')", "null")
            .replace("data:application/pdf;base64,aG1t", "data:text/plain;base64,aG1t")
            .replace("Please Disable Sandbox", "")
            .replace("<h1>Please Disable Sandbox</h1>", "")
    }

    private fun neutralizeHtml(rawHtml: String): String {
        val antiSandboxScript = "<script>" +
            "try{let _d=window.location.hostname;Object.defineProperty(document,'domain',{get:()=>_d,set:v=>{_d=v;return _d;},configurable:true});}catch(e){}" +
            "try{window.open=function(){return null;};window.alert=function(){};window.confirm=function(){return false;};}catch(e){}" +
            "try{" +
            "function _noopDevtool(){return{isRunning:false,isDevToolOpened:function(){return false;},stop:function(){}}};" +
            "_noopDevtool.isRunning=false;" +
            "_noopDevtool.isDevToolOpened=function(){return false;};" +
            "_noopDevtool.stop=function(){};" +
            "_noopDevtool.md5=function(){return '';};" +
            "window.DisableDevtool=_noopDevtool;" +
            "window.NeutralizedDevtool=_noopDevtool;" +
            "try{Object.defineProperty(window,'DisableDevtool',{get:function(){return _noopDevtool;},set:function(){},configurable:true});}catch(e){}" +
            "try{Object.defineProperty(window,'NeutralizedDevtool',{get:function(){return _noopDevtool;},set:function(){},configurable:true});}catch(e){}" +
            "}catch(e){}" +
            "try{" +
            "if(window.navigator){" +
            "var _emptyPlugins={0:null,length:0,item:function(){return null;},namedItem:function(){return null;},refresh:function(){}};" +
            "try{Object.defineProperty(Navigator.prototype,'plugins',{get:function(){return _emptyPlugins;},configurable:true});}catch(e){}" +
            "try{Object.defineProperty(navigator,'plugins',{get:function(){return _emptyPlugins;},configurable:true});}catch(e){}" +
            "}" +
            "if(window.PluginArray&&window.PluginArray.prototype){" +
            "PluginArray.prototype.namedItem=function(){return null;};" +
            "PluginArray.prototype.item=function(){return null;};" +
            "}" +
            "}catch(e){}" +
            "</script>"
        val antiAdStyle = "<style>#sbxErr, #asb, .ad-banner, .pop-under, .ad-overlay, [class*=\"advertisement\" i], [id*=\"advertisement\" i], a[href*=\"adplox.com\"], a[href*=\"bet\" i], div[style*=\"z-index: 99999\"], div[style*=\"z-index: 2147483647\"], div[id*=\"gift\" i], div[class*=\"gift\" i], img[src*=\"gift\" i], a[href*=\"gift\" i], div[class*=\"floating-ad\" i], div[id*=\"floating-ad\" i], [class*=\"floating\" i]:not(#vidup-player):not(.player-container), div[class*=\"bonus\" i], div[id*=\"bonus\" i], [class*=\"casino\" i], [id*=\"casino\" i], [class*=\"claim\" i], [id*=\"claim\" i], [class*=\"wheel\" i], [id*=\"wheel\" i], [class*=\"reward\" i], [id*=\"reward\" i], [class*=\"badge\" i]:not(.quality-badge), [id*=\"badge\" i], [class*=\"spin\" i], [id*=\"spin\" i], [class*=\"lucky\" i], [id*=\"lucky\" i], [class*=\"promo\" i], [id*=\"promo\" i], [class*=\"present\" i], [id*=\"present\" i], a[href*=\"gift\" i], a[href*=\"bonus\" i], div[style*=\"position: fixed\"][style*=\"bottom:\"], div[style*=\"position: absolute\"][style*=\"bottom:\"][style*=\"right:\"], div[class*=\"recaptcha\" i], iframe[src*=\"recaptcha\" i], div[class*=\"cf-turnstile\" i], iframe[src*=\"turnstile\" i], div[id*=\"turnstile\" i], div[class*=\"atlantic\" i], div[id*=\"atlantic\" i], [class*=\"vjs-ad\" i], .video-ads, .ytp-ad-module { display: none !important; pointer-events: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; max-height: 0 !important; }</style>"
        val telemetryScript = "<script>(function(){" +
            "function s(t,c,d,src){try{var p={type:t,event:t,currentTime:c||0,duration:d||0,playing:true,src:src||''};if(window.parent&&window.parent!==window)window.parent.postMessage(p,'*');if(window.top&&window.top!==window.parent&&window.top!==window)window.top.postMessage(p,'*');}catch(e){}}" +
            "window.addEventListener('message',function(ev){if(ev.data&&(ev.data.type==='timeupdate'||ev.data.event==='timeupdate'||ev.data.event==='playing'||ev.data.type==='playing'||ev.data.event==='play'||ev.data.type==='play'||ev.data.event==='frameXTV:timeupdate'||ev.data.type==='warning_slide'||ev.data.type==='PLAYER_EVENT'||ev.data.type==='ad_video_detected')){try{if(window.parent&&window.parent!==window)window.parent.postMessage(ev.data,'*');}catch(e){}try{if(window.top&&window.top!==window.parent&&window.top!==window)window.top.postMessage(ev.data,'*');}catch(e){}}});" +
            "var hasReportedWarning=false;" +
            "function cwCheckText(){" +
                "try{" +
                    "if(hasReportedWarning)return;" +
                    "var txt=((document.body&&document.body.innerText)?document.body.innerText:'')+' '+document.title;" +
                    "var low=txt.toLowerCase();" +
                    "var isDead=" +
                        "low.indexOf('cloudflare warp')!==-1||" +
                        "low.indexOf('atlantic.st')!==-1||" +
                        "low.indexOf('classroom.best')!==-1||" +
                        "low.indexOf(\"couldn't find this content\")!==-1||" +
                        "low.indexOf('could not find this content')!==-1||" +
                        "low.indexOf('media not found')!==-1||" +
                        "low.indexOf('404 not found')!==-1||" +
                        "low.indexOf('video unavailable')!==-1||" +
                        "low.indexOf('content unavailable')!==-1||" +
                        "low.indexOf('file was deleted')!==-1||" +
                        "low.indexOf('video could not be loaded')!==-1||" +
                        "low.indexOf('disable-devtool')!==-1||" +
                        "low.indexOf('no streams found')!==-1||" +
                        "low.indexOf('playback crashed')!==-1||" +
                        "low.indexOf('application error: a client-side exception has occurred')!==-1||" +
                        "low.indexOf('a client-side exception has occurred')!==-1||" +
                        "low.indexOf('we couldn\\'t find this content')!==-1;" +
                    "if(isDead){" +
                        "hasReportedWarning=true;" +
                        "try{var vs=document.querySelectorAll('video');for(var k=0;k<vs.length;k++){vs[k].pause();vs[k].src='';}}catch(e){}" +
                        "var p={type:'warning_slide',event:'warning_slide',currentTime:0,duration:0,playing:false,src:window.location.href};" +
                        "if(window.parent&&window.parent!==window)window.parent.postMessage(p,'*');" +
                        "if(window.top&&window.top!==window.parent&&window.top!==window)window.top.postMessage(p,'*');" +
                    "}" +
                "}catch(e){}" +
            "}" +
            "setInterval(cwCheckText,400);" +
            "function cwHandleAds(){" +
                "try{" +
                    "var skipBtns=document.querySelectorAll('.videoAdUiSkipButton,.skip-button,.skip-ad,.ad-skip,[class*=\"skip\" i],[id*=\"skip\" i],.jw-skip,.vjs-skip,button.skip,div.skip');" +
                    "for(var j=0;j<skipBtns.length;j++){try{skipBtns[j].click();}catch(e){}}" +
                    "var backupBtns=document.querySelectorAll('button[aria-label*=\"Backup\" i],.backup-server-btn,button[class*=\"backup\" i]');" +
                    "for(var b=0;b<backupBtns.length;b++){try{backupBtns[b].click();}catch(e){}}" +
                    "var gifts=document.querySelectorAll('div[class*=\"gift\" i],div[id*=\"gift\" i],img[src*=\"gift\" i],div[class*=\"bonus\" i],div[id*=\"bonus\" i],div[class*=\"reward\" i],div[class*=\"spin\" i],div[id*=\"spin\" i],div[class*=\"lucky\" i],div[id*=\"lucky\" i],div[class*=\"promo\" i],div[id*=\"promo\" i],div[class*=\"present\" i],a[href*=\"gift\" i],a[href*=\"bonus\" i],div[style*=\"bottom:\"][style*=\"right:\"]');" +
                    "for(var g=0;g<gifts.length;g++){try{gifts[g].style.display='none';gifts[g].style.visibility='hidden';}catch(e){}}" +
                "}catch(e){}" +
            "}" +
            "setInterval(cwHandleAds,350);" +
            "function a(){" +
                "var vs=document.querySelectorAll('video');" +
                "for(var i=0;i<vs.length;i++){" +
                    "var v=vs[i];" +
                    "var vsrc=(v.currentSrc||v.src||'').toLowerCase();" +
                    "if(vsrc.indexOf('atlantic.st')!==-1||vsrc.indexOf('classroom.best')!==-1||vsrc.indexOf('dummy')!==-1||vsrc.indexOf('notfound')!==-1||vsrc.indexOf('media_not_found')!==-1){" +
                        "s('warning_slide',0,0,vsrc);" +
                        "try{v.pause();v.src='';}catch(e){}" +
                        "continue;" +
                    "}" +
                    "if(v.duration>0&&v.duration<=210){" +
                        "s('ad_video_detected',v.currentTime,v.duration,vsrc);" +
                        "try{v.playbackRate=16.0;if(v.currentTime<v.duration-0.2){v.currentTime=v.duration;}}catch(e){}" +
                    "}" +
                    "if(v._cwAtt)continue;" +
                    "v._cwAtt=true;" +
                    "v.addEventListener('play',function(){" +
                        "var s1=(this.currentSrc||this.src||'').toLowerCase();" +
                        "if(s1.indexOf('atlantic.st')!==-1||s1.indexOf('classroom.best')!==-1){s('warning_slide',0,0,s1);try{this.pause();this.src='';}catch(e){}return;}" +
                        "if(this.duration>0&&this.duration<=210){s('ad_video_detected',this.currentTime,this.duration,s1);try{this.playbackRate=16.0;if(this.currentTime<this.duration-0.2)this.currentTime=this.duration;}catch(e){}return;}" +
                        "s('play',this.currentTime,this.duration,s1);" +
                    "});" +
                    "v.addEventListener('playing',function(){" +
                        "var s2=(this.currentSrc||this.src||'').toLowerCase();" +
                        "if(s2.indexOf('atlantic.st')!==-1||s2.indexOf('classroom.best')!==-1){s('warning_slide',0,0,s2);try{this.pause();this.src='';}catch(e){}return;}" +
                        "if(this.duration>0&&this.duration<=210){s('ad_video_detected',this.currentTime,this.duration,s2);try{this.playbackRate=16.0;if(this.currentTime<this.duration-0.2)this.currentTime=this.duration;}catch(e){}return;}" +
                        "s('playing',this.currentTime,this.duration,s2);" +
                    "});" +
                    "v.addEventListener('timeupdate',function(){" +
                        "var s3=(this.currentSrc||this.src||'').toLowerCase();" +
                        "if(s3.indexOf('atlantic.st')!==-1||s3.indexOf('classroom.best')!==-1){s('warning_slide',0,0,s3);try{this.pause();this.src='';}catch(e){}return;}" +
                        "if(this.duration>0&&this.duration<=210){s('ad_video_detected',this.currentTime,this.duration,s3);try{this.playbackRate=16.0;if(this.currentTime<this.duration-0.2)this.currentTime=this.duration;}catch(e){}return;}" +
                        "if(this.currentTime>0)s('timeupdate',this.currentTime,this.duration,s3);" +
                    "});" +
                "}" +
            "}" +
            "setInterval(a,300);" +
            "if(document.readyState==='complete'||document.readyState==='interactive'){a();cwCheckText();cwHandleAds();}" +
            "else{document.addEventListener('DOMContentLoaded',function(){a();cwCheckText();cwHandleAds();});window.addEventListener('load',function(){a();cwCheckText();cwHandleAds();});}" +
        "})();</script>"

        var result = rawHtml
        val headIdx = result.indexOf("<head>", ignoreCase = true)
        if (headIdx != -1) {
            result = result.substring(0, headIdx + 6) + antiSandboxScript + antiAdStyle + telemetryScript + result.substring(headIdx + 6)
        } else {
            val htmlIdx = result.indexOf("<html>", ignoreCase = true)
            if (htmlIdx != -1) {
                result = result.substring(0, htmlIdx + 6) + "<head>" + antiSandboxScript + antiAdStyle + telemetryScript + "</head>" + result.substring(htmlIdx + 6)
            } else {
                result = antiSandboxScript + antiAdStyle + telemetryScript + result
            }
        }

        result = result
            .replace("try{document.domain=document.domain}catch(t){r();return}", "")
            .replace("if(window.frameElement.hasAttribute(\"sandbox\")){r()}", "")
            .replace("if(window.frameElement.hasAttribute('sandbox')){r()}", "")
            .replace("isReallySandboxed()", "false")
            .replace("/asb.html", "/disabled_asb.html")
            .replace("/sandbox.php", "/disabled_sandbox.php")
            .replace("/embedblocked", "/disabled_embedblocked")
            .replace("if(s){die();throw'';}", "// neutralized anti-sandbox")
            .replace("sandboxed=true", "sandboxed=false")
            .replace("sandboxed=e&&e.name==='SecurityError'", "sandboxed=false")
            .replace("if((framed||dev)&&!sandboxed)return;", "/* bypass sandbox gate */")
            .replace("if((framed||dev)&&!sandboxed)", "if(true)")
            .replace("document.domain=document.domain", "// neutralized domain")
            .replace("Please Disable Sandbox", "")
            .replace("<h1>Please Disable Sandbox</h1>", "")
            .replace("return void t()", "return")
            .replace("return void t();", "return;")
            .replace("e.onerror=()=>(t(),!0)", "e.onerror=()=>true")
            .replace("e.onerror=()=>t()", "e.onerror=()=>{}")
            .replace("e.onerror=()=>{t()}", "e.onerror=()=>{}")
            .replace("e.onerror=function(){t()}", "e.onerror=function(){}")
            .replace("window.self!==window.top", "false")
            .replace("window.self!=window.top", "false")
            .replace("window.navigator.plugins.namedItem(\"Chrome PDF Viewer\")", "null")
            .replace("window.navigator.plugins.namedItem('Chrome PDF Viewer')", "null")
            .replace("navigator.plugins.namedItem(\"Chrome PDF Viewer\")", "null")
            .replace("navigator.plugins.namedItem('Chrome PDF Viewer')", "null")
            .replace("data:application/pdf;base64,aG1t", "data:text/plain;base64,aG1t")
            .replace("DisableDevtool", "NeutralizedDevtool")
            .replace("/assets/disable-devtool.js", "/assets/neutralized.js")
            .replace("/assets/sbx.js", "/assets/neutralized.js")

        // Strip autoembed and vidbolt anti-sandbox scripts and casino ad generation scripts
        result = result.replace(Regex("<script[^>]*>[\\s\\S]*?asb\\.html[\\s\\S]*?</script>", RegexOption.IGNORE_CASE), "")
        result = result.replace(Regex("<script[^>]*>[\\s\\S]*?var die=function[\\s\\S]*?</script>", RegexOption.IGNORE_CASE), "")
        result = result.replace(Regex("<script[^>]*>[\\s\\S]*?ad_slot[\\s\\S]*?</script>", RegexOption.IGNORE_CASE), "")
        result = result.replace(Regex("<script[^>]*>[\\s\\S]*?window\\.frameElement[\\s\\S]*?</script>", RegexOption.IGNORE_CASE), "")
        result = result.replace(Regex("<script[^>]*>[\\s\\S]*?Remove the <code>sandbox</code>[\\s\\S]*?</script>", RegexOption.IGNORE_CASE), "")
        result = result.replace(Regex("<script[^>]*>[\\s\\S]*?Playback disabled[\\s\\S]*?</script>", RegexOption.IGNORE_CASE), "")

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

        // Explicitly block turnstile challenges, robot verification, fake media cards, and anti-sandbox redirects
        if (host.contains("turnstile") || urlStr.contains("turnstile") ||
            urlStr.contains("challenges.cloudflare.com") ||
            urlStr.contains("recaptcha") || host.contains("recaptcha") ||
            host.contains("atlantic.st") || urlStr.contains("atlantic.st") ||
            host.contains("amnestyinternational.dev") || urlStr.contains("amnestyinternational.dev") ||
            host.contains("classroom.best") || urlStr.contains("classroom.best") ||
            host.contains("disable-devtool") || urlStr.contains("disable-devtool") ||
            host.contains("theajack.github.io") || urlStr.contains("theajack.github.io") ||
            path.contains("disable-devtool") ||
            path.contains("sbx.js") ||
            path.contains("sandbox.php") ||
            path.contains("asb.html") ||
            urlStr.contains("asb.html")
        ) {
            return true
        }

        // Whitelist app assets, internal endpoints, and verified embed & streaming providers FIRST
        // so that their hashed webpack chunks (e.g. ending in *ad.js) or benign parameters are never blocked
        val isWhitelistedHost = host == "appassets.androidplatform.net" ||
            host.contains("framextv") ||
            host.contains("autoembed") ||
            host.contains("vidbolt") ||
            host.contains("vidup") ||
            host.contains("hakunaymatata") ||
            host.contains("johndoesdmc") ||
            host.contains("vidlink") ||
            host.contains("smashystream") ||
            host.contains("anyembed") ||
            host.contains("vidsrc") ||
            host.contains("2embed") ||
            host.contains("moviesapi") ||
            host.contains("multiembed") ||
            host.contains("streamingnow.mov") ||
            host.contains("enc-dec.app") ||
            host.contains("totallyacdn.cc") ||
            host.contains("fprime.at") ||
            host.contains("cinejoy.pk") ||
            host.contains("movy.sx") ||
            host.contains("videasy.to") ||
            host.contains("filmboom.top") ||
            host.contains("themoviedb.org") ||
            host.contains("tmdb.org") ||
            host.contains("hscow.com") ||
            host.contains("strem.io") ||
            host.contains("rezesubs.com") ||
            host.contains("slowcloud.live") ||
            host.contains("hybrows.workers.dev") ||
            host.contains("wsrv.nl")

        if (isWhitelistedHost) {
            // Even on whitelisted hosts, block known ad routes or sandbox redirect traps
            if (path.contains("/__ads") || path.contains("/ads/") || urlStr.contains("/__ads/") ||
                path.endsWith("/ad.js") || path.endsWith("/ads.js") || path.endsWith("/popad.js") ||
                path.contains("disable-devtool") || path.contains("sbx.js") || path.contains("sandbox.php")) {
                return true
            }
            return false
        }

        // Explicitly block ad injection scripts, soycdn, and popup widgets on non-whitelisted hosts
        if (host.contains("soycdn") ||
            host.contains("createlouisville") ||
            host.contains("tagivi") ||
            host.contains("histats") ||
            host.contains("profiton") ||
            host.contains("vast") ||
            host.contains("vpaid") ||
            host.contains("vidverto") ||
            host.contains("springserve") ||
            host.contains("spotx") ||
            path.contains("/__ads") ||
            path.contains("/ads/") ||
            urlStr.contains("/__ads/") ||
            urlStr.contains("vidsrcto.js") ||
            path.endsWith("/ad.js") ||
            path.endsWith("/ads.js") ||
            urlStr.contains("/ad.js?") ||
            urlStr.contains("gift") ||
            urlStr.contains("bonus") ||
            urlStr.contains("wheel") ||
            urlStr.contains("promo")
        ) {
            return true
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
            "atlantic.st",
            "totallyacdn.cc",
            "classroom.best",
            "disable-devtool",
            "theajack.github.io",
            "sbx.js",
            "sandbox.php",
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
