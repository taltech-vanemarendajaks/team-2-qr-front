module.exports = {
    devServer: {
        proxy: 'http://localhost:8080',
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
        }
    }
}