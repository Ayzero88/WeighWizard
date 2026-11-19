import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ToPdf2 = ({ contentIdName }) => {
  return new Promise((resolve, reject) => {
    const input = document.getElementById(contentIdName);

    html2canvas(input, { scale: 1 })
      .then((canvas) => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4', true, false);

        const pdfWidth = pdf.internal.pageSize.width;
        const pdfHeight = pdf.internal.pageSize.height;
        let position = 0;
        const imgHeight = canvas.height * pdfWidth / canvas.width;
        
        // Add the first image
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        
        // Check if there's remaining content
        if (imgHeight > pdfHeight) {
          // Add more pages if needed
          while (imgHeight - position >= pdfHeight) {
            position += pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, imgHeight);
          }
        }
        
        // Resolve the Promise with the PDF data
        const pdfData = pdf.output('blob');
        resolve(pdfData);
      })
      .catch((error) => {
        // Reject the Promise if an error occurs
        reject(error);
      });
  });
};

export default ToPdf2;


