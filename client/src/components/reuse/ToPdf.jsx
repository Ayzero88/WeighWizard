import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


const ToPdf = ({ contentIdName }) => {
  return new Promise((resolve, reject) => {
    const input = document.getElementById(contentIdName);

    html2canvas(input, {scale: 1})
      .then((canvas) => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4', true, false);
        

        pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height);
        const pdfData = pdf.output('blob');

        // Resolve the Promise with the PDF data
        resolve(pdfData);
      })
      .catch((error) => {
        // Reject the Promise if an error occurs
        reject(error);
      });
  });
};

export default ToPdf;