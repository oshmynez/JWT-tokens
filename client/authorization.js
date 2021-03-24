
const App = Vue.createApp({
    data() {
        return {
            openSigInAndLogin: false,
            signInOrLogIn: 0,
            successfulAuthorization: false,
            form: {
                email: '',
                pass: '',
                countArticles: 0,
                dateOfRegistration: '',
            }
        }
    },
    methods: {
        async userAuthorization() {
            const {...user} = this.form
            console.log(user)

            if (this.signInOrLogIn === 1) {
                const result = await request('/api/userSignIn', 'POST', user)
                console.log(result)
            }

            if (this.signInOrLogIn === 2) {
                user.dateOfRegistration = formatData()
                const result = await request('/api/userSignUp', 'POST', user)
                console.log(result)
            }
        }, SignInUser() {
            this.signInOrLogIn = 1
        },
        SignUpUser() {
            this.signInOrLogIn = 2
        }
    }
})

export function formatData() {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dateObj = new Date()
    const month = dateObj.getMonth()
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    return year + '-' + month + '-' + day
}

async function request(url, method = 'GET', data = null) {
    try {
        const headers = {}
        let body

        if (data) {
            headers['Content-Type'] = 'application/json'
            body = JSON.stringify(data)
        }

        const response = await fetch(url, {
            method,
            headers,
            body
        })
        return await response.json()
    } catch (e) {
        console.warn('Error:', e.message)
    }
}

App.mount('#authorization')