(function () {
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
})()