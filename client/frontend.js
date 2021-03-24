const App = Vue.createApp({
    data() {
        return {
            attachment: {name: null, file: null},
            userName: '',
            currentPageFlag: 2, //1 - createArticlePage,2 - top10page,3 -allArticles, 4 - aboutMe
            sortFlag: false,
            likeFlag: false,
            dislikeFlag: false,
            loading: false,
            readMoreArticle: false,
            aboutAuthor: false,
            getAccessToCreateArticle: false,
            dislike: '/dislike_black.png',
            like: '/like_black.png',
            dateFilter: '/cross.png',
            viewFilter: '/cross.png',
            likeFilter: '/cross.png',
            disLikeFilter: '/cross.png',
            leftArrow: '/leftArrow.png',
            rightArrow: '/rightArrow.png',
            openCloseComments: 'Просмотреть комментарии',
            form: {
                title: '',
                description: '',
                date: '',
                likes: 0,
                dislikes: 0,
                views: 0,
                commentsCount: 0,
                comments: [],
                file: '',
                author: ''
            },
            primaryArticles: [],
            articles: [],
            articleFullInfo: [],
            articlesSort: [],
        }
    },
    methods: {
        async createArticle() {
            const {...article} = this.form
            article.date = formatData
            article.author = "Michael"
            article.likes = article.dislikes = article.views = 0
            const newArticle = await request('/api/articles', 'POST', article)
            this.articles.push(newArticle)
        },
        /*async markArticle(id) {
            const article = this.articles.find(c => c.id === id)
            const updated = await request(`/api/articles/${id}`, 'PUT', {
                ...article,
                marked: true
            })
            article.marked = updated.marked
        },*/
        /* async removeArticle(id) {
             await request(`/api/articles/${id}`, 'DELETE')
             this.articles = this.articles.filter(c => c.id !== id)
         },*/
        async checkAccessToCreateArticle() {
            this.currentPageFlag = 1
            const result = await request('/api/checkAccess', 'GET')
            console.log(result)
            if (result != null) {
                this.getAccessToCreateArticle = true;
            }
        },
        async handleFileUpload() {
            const formData = new FormData()
            formData.append('file', this.$refs.file.files[0])
            console.log(formData)
            const newArticle = await requestImage('/api/articlesImage', 'POST', formData)
        },
        async openArticle(id) {
            this.readMoreArticle = !this.readMoreArticle
            this.articleFullInfo = await request(`/api/articles/${id}`, 'GET')
            this.currentPageFlag = 3
            comment.currentPageFlag = 3
        },
        async dislikeLikeChange() {
            if (this.dislike === '/dislike_black.png') {
                this.dislike = '/dislike_red.png'
                this.like = '/like_black.png'
                return
            }
            if (this.like === '/like_black.png') {
                this.like = '/like_green.png'
                this.dislike = '/dislike_black.png'
            }
        },
        async sortArticles() {
            this.primaryArticles = this.articles
            if (this.dateFilter === '/ok.png') {
                this.articles.sort().reverse();

            } else if (this.viewFilter === '/ok.png') {
                this.articles.sort(byField('views'))
            } else if (this.likeFilter === '/ok.png') {
                this.articles.sort(byField('likes'))
            } else if (this.disLikeFilter === '/ok.png') {
                this.articles.sort(byField('dislikes'))
            } else this.articles = this.primaryArticles
        },
        async sortTypeChange(type) {
            switch (type) {
                case 1:
                    this.viewFilter = this.likeFilter = this.disLikeFilter = '/cross.png'
                    this.dateFilter = this.dateFilter === '/cross.png' ? '/ok.png' : '/cross.png'
                    break;
                case 2:
                    this.dateFilter = this.likeFilter = this.disLikeFilter = '/cross.png'
                    this.viewFilter = this.viewFilter === '/cross.png' ? '/ok.png' : '/cross.png'
                    break;
                case 3:
                    this.dateFilter = this.viewFilter = this.disLikeFilter = '/cross.png'
                    this.likeFilter = this.likeFilter === '/cross.png' ? '/ok.png' : '/cross.png'
                    break;
                case 4:
                    this.dateFilter = this.viewFilter = this.likeFilter = '/cross.png'
                    this.disLikeFilter = this.disLikeFilter === '/cross.png' ? '/ok.png' : '/cross.png'
            }
        },
        mouseOver(i) {
            if (i === 1) {
                this.leftArrow = '/leftArrowRed.png'
            } else if (i === 2) {
                this.rightArrow = '/rightArrowRed.png'
            }

        },
        mouseLeave(i) {
            if (i === 1) {
                this.leftArrow = '/leftArrow.png'
            } else if (i === 2) {
                this.rightArrow = '/rightArrow.png'
            }
        },
    },
    async mounted() {
        this.loading = true;
        this.articles = await request('/api/articles')
        this.loading = false;
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

function byField(field) {
    return (a, b) => a[field] > b[field] ? 1 : -1;
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

async function requestImage(url, method = 'GET', data = null) {
    try {
        const headers = {}
        let body

        if (data) {
            headers['Content-Type'] = 'multipart/form-data'
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

App.component('loader', {
    template: `
    <div style="display: flex; justify-content: center;align-items: center; margin: 20px">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  `
})
App.mount('#app')
