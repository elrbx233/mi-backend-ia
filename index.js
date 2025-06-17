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

    // Si la respuesta no tiene 'choices' válidos
    if (!data.choices || !data.choices[0]) {
      console.error("Respuesta inválida de OpenAI:", data);
      return res.status(500).json({
        error: "Respuesta inválida de OpenAI",
        detalle: data
      });
    }

    res.json({ respuesta: data.choices[0].message.content });

  } catch (err) {
    console.error("Error al comunicar con OpenAI:", err);
    try {
      const text = await respuesta.text?.(); // fallback si .json falla
      return res.status(500).json({
        mensaje: "Error inesperado al llamar a OpenAI",
        error: err.message,
        textoDevuelto: text
      });
    } catch {
      return res.status(500).send("Fallo al procesar respuesta de OpenAI.");
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
