document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const pdfFile = document.getElementById('pdfFile').files[0];
    if (!pdfFile) {
        alert('Please select a PDF file.');
        return;
    }

    const text = await extractTextFromPDF(pdfFile);
    const translatedText = await translateTextToEnglish(text);
    document.getElementById('translationResult').innerText = translatedText;
});

async function extractTextFromPDF(file) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map(item => item.str).join(' ') + ' ';
    }

    return text;
}

async function translateTextToEnglish(text) {
    const response = await fetch('https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=en', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': 'YOUR_TRANSLATOR_API_KEY',
            'Ocp-Apim-Subscription-Region': 'YOUR_REGION'
        },
        body: JSON.stringify([{Text: text}])
    });

    const result = await response.json();
    return result[0].translations[0].text;
}
