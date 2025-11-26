function Timer() {
    const targetStr = '2025-11-26T08:00:00+01:00'
    const targetDate = new Date(targetStr)

    const $days = document.getElementById('days')
    const $hours = document.getElementById('hours')
    const $minutes = document.getElementById('minutes')
    const $seconds = document.getElementById('seconds')

    function pad(n) { return String(n).padStart(2, '0') }

    function update() {
        const now = new Date()
        let diff = Math.max(0, targetDate - now)

        if (diff <= 0) {
            $days.textContent = '0'
            $hours.textContent = '00'
            $minutes.textContent = '00'
            $seconds.textContent = '00'
            document.querySelector('.title').textContent = 'Die AP2 Winter 2025 hat begonnen!'
            clearInterval(timer)
            return
        }

        const sec = Math.floor(diff / 1000) % 60
        const min = Math.floor(diff / (1000 * 60)) % 60
        const hrs = Math.floor(diff / (1000 * 60 * 60)) % 24
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        $days.textContent = days
        $hours.textContent = pad(hrs)
        $minutes.textContent = pad(min)
        $seconds.textContent = pad(sec)
    }

    update()
    const timer = setInterval(update, 1000)
}

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DB_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
}

firebase.initializeApp(firebaseConfig)
const database = firebase.database()
const votesRef = database.ref("votes")

const hasVoted = localStorage.getItem('ap2_voted') === 'true'

const sendButton = document.getElementById("send")
const statusText = document.getElementById("status")
const berufSelect = document.getElementById("beruf")

const showVoteBtn = document.getElementById('showVote')
const showResultsBtn = document.getElementById('showResults')
const voteBox = document.querySelector('.vote-box')
const resultsBox = document.querySelector('.results-box')

let showVote = false
let showResults = false

showVoteBtn.addEventListener('click', () => {
    if (voteBox.style.display === 'block') {
        voteBox.style.display = 'none'
    } else {
        showVote = true
        showResults = false
        voteBox.style.display = 'block'
        resultsBox.style.display = 'none'
    }
})

showResultsBtn.addEventListener('click', () => {
    if (resultsBox.style.display === 'block') {
        resultsBox.style.display = 'none'
    } else {
        showResults = true
        showVote = false
        resultsBox.style.display = 'block'
        voteBox.style.display = 'none'
        loadResults()
    }
})

const slider = document.getElementById("gefühl")
const score = document.getElementById("score")
slider.addEventListener("input", () => { score.textContent = slider.value })

if (hasVoted) {
    sendButton.disabled = true
    statusText.textContent = "Du hast bereits abgestimmt!"
} else {
    sendButton.addEventListener("click", () => {
        const beruf = berufSelect.value
        const gefühl = Number(slider.value)

        votesRef.push({
            beruf: beruf,
            gefühl: gefühl,
            timestamp: Date.now()
        }).then(() => {
            localStorage.setItem('ap2_voted', 'true')
            sendButton.disabled = true
            statusText.textContent = "Danke für deine Stimme!"
        }).catch(err => {
            console.error(err)
            statusText.textContent = "Fehler beim Absenden. Bitte versuche es erneut."
        })
    })
}

function getMoodLabel(score) {
    if (score === 0) return "Keine Stimmen"
    if (score < 2) return "Fuck."
    if (score < 4) return "Geht so"
    if (score < 6) return "Neutral"
    if (score < 8) return "Gut"
    return "Perfekt"
}

function loadResults() {
    votesRef.once('value', snapshot => {
        const data = snapshot.val()
        const container = document.getElementById('resultsContent')
        container.innerHTML = ''

        if (!data) {
            container.textContent = 'Noch keine Stimmen.'
            return
        }

        let totals = { FISI: 0, FIAE: 0, FIDV: 0, FIDP: 0 }
        let counts = { FISI: 0, FIAE: 0, FIDV: 0, FIDP: 0 }
        let totalVotes = 0

        for (let id in data) {
            const vote = data[id]
            if (totals.hasOwnProperty(vote.beruf)) {
                totals[vote.beruf] += Number(vote.gefühl)
                counts[vote.beruf]++
                totalVotes++
            } else {
                console.warn("Ungültiger Beruf:", vote.beruf)
            }
        }

        const totalDiv = document.createElement('div')
        totalDiv.classList.add('total-votes')
        totalDiv.textContent = `Insgesamt abgegebene Stimmen: ${totalVotes}`
        container.appendChild(totalDiv)

        for (let b in totals) {
            const avg = counts[b] ? (totals[b] / counts[b]).toFixed(1) : 0
            const barWidth = (avg / 10) * 100

            const div = document.createElement('div')
            div.classList.add('result-item')
            div.innerHTML = `
                <div class="label">${b} - ${getMoodLabel(avg)}</div>
                <div class="value">${avg}/10 (${counts[b]} Stimmen)</div>
                <div class="bar" style="width:${barWidth}%"></div>
            `
            container.appendChild(div)
        }
    })
}
