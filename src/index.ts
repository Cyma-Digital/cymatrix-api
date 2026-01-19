import express from "express"
const app = express()
const port = 3000

app.get("/", (req, res) => {
  res.send("ok")
})

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`)
})
