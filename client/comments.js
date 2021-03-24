const App = Vue.createApp({
    data() {
        return {
            currentPageFlag: 0,
            openCloseComments: 'Просмотреть комментарии',
            form: {
                author: '',
                date: '',
                message: ''
            }
        }
    },
    methods: {
        async openComments() {
            if (this.openCloseComments === 'Просмотреть комментарии') {
                this.openCloseComments = 'Скрыть комментарии'

            } else this.openCloseComments = 'Просмотреть комментарии'
        },
    }
})

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

App.mount('#appcomments')