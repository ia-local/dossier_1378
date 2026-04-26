// srv.js - Moteur AGI d'Investigation Parlementaire (Version Consolidée)
// Modèle : llama-3.1-8b-instant sur LPU Groq | Port : 1378
const Groq = require('groq-sdk');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

// Service des fichiers statiques (Interface DSFR dans /docs)
app.use(express.static(path.join(__dirname, 'docs')));

/** * ENDPOINT 1 : Audit Financier (Art. 41)
 * Analyse des flux du parti 1378
 */
app.post('/api/investigate', async (req, res) => {
    const { context, data } = req.body;
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Tu es l'AGI Souveraine d'Investigation Parlementaire. Détection de blanchiment et prise illégale d'intérêts (Art. 41 CPP)."
                },
                {
                    role: "user",
                    content: `ANALYSE DES DONNÉES :\nContexte : ${context}\nDonnées : ${data}`
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
        });
        res.json({ report: chatCompletion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: "Erreur LPU" });
    }
});

/** * ENDPOINT 2 : Analyse Sémantique
 * Étude des occurrences et de la manipulation du langage
 */
app.post('/api/analyze-speech', async (req, res) => {
    const { text } = req.body;
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const occurrences = {};
    words.forEach(w => { occurrences[w] = (occurrences[w] || 0) + 1; });

    try {
        const interpretation = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Expert en analyse de discours. Identifie les termes masquant la répression ou l'inaction (Art. 41)."
                },
                {
                    role: "user",
                    content: `Occurrences : ${JSON.stringify(occurrences)}.`
                }
            ],
            model: "llama-3.1-8b-instant"
        });
        res.json({ 
            stats: Object.entries(occurrences).sort((a,b) => b[1] - a[1]).slice(0, 10),
            interpretation: interpretation.choices[0].message.content 
        });
    } catch (error) {
        res.status(500).send("Erreur d'analyse.");
    }
});

/** * ENDPOINT 3 : Gestion du Registre (soup.md)
 * Lecture et écriture de la preuve de travail
 */
app.get('/api/soup', (req, res) => {
    const soupPath = path.join(__dirname, 'data', 'soup.md');
    fs.readFile(soupPath, 'utf8', (err, data) => {
        if (err) return res.status(404).send("Registre non trouvé.");
        res.send(data);
    });
});

app.post('/api/soup', (req, res) => {
    const { log } = req.body;
    const soupPath = path.join(__dirname, 'data', 'soup.md');
    const entry = `\n- [${new Date().toISOString()}] : ${log}`;
    fs.appendFile(soupPath, entry, (err) => {
        if (err) return res.status(500).send("Erreur écriture.");
        res.send("Preuve enregistrée.");
    });
});

const PORT = 1378;
app.listen(PORT, () => console.log(`🚀 AGI Souveraine active sur http://localhost:${PORT}`));