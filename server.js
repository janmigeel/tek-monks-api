const https = require('https')
const http = require('http')

const getLatestStories = (callback) => {
  const url = 'https://time.com/'

  https.get(url, (response) => {
    let data = ''

    response.on('data', (chunk) => {
      data += chunk
    })

    response.on('end', () => {
      const stories = parseLatestStories(data)
      callback(stories)
    })
  }).on('error', (error) => {
    console.error(`Error fetching data: ${error}`)
  })
}
const parseLatestStories = (htmlData) => {
  const stories = []
  const itemRegex = /<li class="latest-stories__item">(.*?)<\/li>/gs
  const titleRegex = /<h3 class="latest-stories__item-headline">(.*?)<\/h3>/
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/

  let match
  while ((match = itemRegex.exec(htmlData)) !== null) {
    const item = match[1]
    const titleMatch = item.match(titleRegex)
    const linkMatch = item.match(linkRegex)

    if (titleMatch && linkMatch) {
      const title = titleMatch[1]
      const link = 'https://time.com' + linkMatch[2]
      stories.push({ title, link })
    }
  }

  return stories
}

const server = http.createServer((req, res) => {
  if (req.url === '/getTimeStories') {
    getLatestStories((data) => {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.writeHead(200)
      res.end(JSON.stringify(data))
    })
  }
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})