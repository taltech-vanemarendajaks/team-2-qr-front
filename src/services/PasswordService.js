export default {
    validateLoginPassword(password) {
        const p = password || ''
        if (p.length === 0) return 'Password is required'
        if (p.length > 50) return 'Password must be at most 50 characters'
        return ''
    },

    validateSignupPassword(password) {
        const p = password || ''
        if (p.length === 0) return 'Password is required'
        if (p.length < 8) return 'Password must be at least 8 characters'
        if (p.length > 50) return 'Password must be at most 50 characters'
        if (!/[A-Za-z]/.test(p)) return 'Password must contain at least one letter'
        if (!/[0-9]/.test(p)) return 'Password must contain at least one number'
        return ''
    }
}
