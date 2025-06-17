const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/preguntar', async (req, res) => {
  const { pregunta } = req.body;

  if (!pregunta) return res.status(400).send("Falta la pregunta");

  try {
    const respuesta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Eres un experto en ayudar a estudiantes." },
          { role: "user", content: pregunta }
        ]
      })
    });

    const data = await respuesta.json();
    res.json({ respuesta: data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error con OpenAI");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));