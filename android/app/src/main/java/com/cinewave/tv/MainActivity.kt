package com.cinewave.tv

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.view.WindowManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.webkit.WebViewAssetLoader
import java.io.ByteArrayInputStream
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL

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

        webView.webViewClient = object : WebViewClient() {
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

                return super.shouldInterceptRequest(view, request)
            }
        }
        webView.webChromeClient = WebChromeClient()

        // Focus management
        webView.isFocusable = true
        webView.isFocusableInTouchMode = true
        webView.requestFocus()
    }

    private fun proxyApiRequest(request: WebResourceRequest): WebResourceResponse? {
        val url = request.url
        val pathAndQuery = url.path + if (url.query != null) "?${url.query}" else ""

        // Try host backend IPs with low timeout, fallback to offline fixtures
        val candidateTargets = listOf(
            "http://192.168.88.129:8080$pathAndQuery",
            "http://10.0.2.2:8080$pathAndQuery",
            "http://192.168.56.1:8080$pathAndQuery",
            "http://172.25.208.1:8080$pathAndQuery"
        )

        for (targetUrl in candidateTargets) {
            try {
                val conn = URL(targetUrl).openConnection() as HttpURLConnection
                conn.requestMethod = request.method
                conn.connectTimeout = 1200
                conn.readTimeout = 3000

                // Forward request headers
                request.requestHeaders?.forEach { (k, v) ->
                    if (!k.equals("Host", ignoreCase = true)) {
                        conn.setRequestProperty(k, v)
                    }
                }

                val status = conn.responseCode
                if (status in 200..499) {
                    val stream: InputStream = if (status in 200..299) {
                        conn.inputStream
                    } else {
                        conn.errorStream ?: ByteArrayInputStream(ByteArray(0))
                    }

                    val headers = mutableMapOf<String, String>()
                    headers["Access-Control-Allow-Origin"] = "*"
                    headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
                    headers["Access-Control-Allow-Headers"] = "*"

                    return WebResourceResponse(
                        conn.contentType ?: "application/json",
                        conn.contentEncoding ?: "UTF-8",
                        status,
                        conn.responseMessage ?: "OK",
                        headers,
                        stream
                    )
                }
            } catch (e: Exception) {
                Log.w("CineWaveProxy", "Candidate $targetUrl failed: ${e.message}")
            }
        }
        return null
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (event.action == KeyEvent.ACTION_DOWN) {
            val keyString = when (event.keyCode) {
                KeyEvent.KEYCODE_DPAD_UP -> "ArrowUp"
                KeyEvent.KEYCODE_DPAD_DOWN -> "ArrowDown"
                KeyEvent.KEYCODE_DPAD_LEFT -> "ArrowLeft"
                KeyEvent.KEYCODE_DPAD_RIGHT -> "ArrowRight"
                KeyEvent.KEYCODE_DPAD_CENTER,
                KeyEvent.KEYCODE_ENTER,
                KeyEvent.KEYCODE_NUMPAD_ENTER,
                KeyEvent.KEYCODE_BUTTON_A -> "Enter"
                KeyEvent.KEYCODE_BACK,
                KeyEvent.KEYCODE_ESCAPE,
                KeyEvent.KEYCODE_BUTTON_B -> "Escape"
                KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> "Enter"
                KeyEvent.KEYCODE_MEDIA_FAST_FORWARD -> "ArrowRight"
                KeyEvent.KEYCODE_MEDIA_REWIND -> "ArrowLeft"
                else -> null
            }

            if (keyString != null) {
                Log.d("NetflixKey", "Forwarding key $keyString to WebView")
                val js = """
                    (function() {
                        try {
                            window.dispatchEvent(new KeyboardEvent('keydown', {
                                key: '$keyString',
                                code: '$keyString',
                                bubbles: true,
                                cancelable: true
                            }));
                        } catch (e) {
                            console.error('Key dispatch failed', e);
                        }
                    })();
                """.trimIndent()
                webView.post {
                    webView.evaluateJavascript(js, null)
                }
                return true
            }
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
        webView.destroy()
        super.onDestroy()
    }
}
