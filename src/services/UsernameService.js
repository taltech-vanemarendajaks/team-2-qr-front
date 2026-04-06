export default {
    validateSignupUsername(username) {
        const u = (username || '').trim()
        if (u.length === 0) return 'Username is required'
        if (u.length < 3) return 'Username must be at least 3 characters'
        if (u.length > 20) return 'Username must be at most 20 characters'
        return ''
    }
}
