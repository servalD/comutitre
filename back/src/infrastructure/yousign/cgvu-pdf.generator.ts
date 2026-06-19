import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

/** Generates a minimal CGVU PDF suitable for YouSign signature. */
@Injectable()
export class CgvuPdfGenerator {
  async generate(params: {
    productCode: string;
    cgvuVersion: string;
    signerName: string;
    contractId: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 60 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .fillColor('#25303B')
        .text("Conditions Générales de Vente et d'Utilisation", {
          align: 'center',
        });

      doc.moveDown(0.5);
      doc
        .fontSize(13)
        .fillColor('#1972D2')
        .text(
          `Produit : ${params.productCode}  —  Version ${params.cgvuVersion}`,
          {
            align: 'center',
          },
        );

      doc.moveDown(1);
      doc
        .moveTo(60, doc.y)
        .lineTo(535, doc.y)
        .strokeColor('#DEEEFF')
        .lineWidth(1)
        .stroke();
      doc.moveDown(1);

      doc
        .fontSize(10)
        .fillColor('#25303B')
        .text(
          'En signant ce document, le souscripteur reconnaît avoir pris connaissance ' +
            "des Conditions Générales de Vente et d'Utilisation du produit " +
            `${params.productCode} émis par Île-de-France Mobilités et acceptées ` +
            'dans leur intégralité.',
        );

      const articles = [
        {
          title: 'Article 1 — Objet et champ d’application',
          body:
            'Les présentes CGVU régissent les droits et obligations du titulaire et du ' +
            'payeur dans le cadre de l’utilisation des services de transport. Toute ' +
            'souscription implique l’acceptation sans réserve de ces conditions.',
        },
        {
          title: 'Article 2 — Souscription et validation',
          body:
            'La souscription est validée après vérification des justificatifs requis, ' +
            'acceptation des présentes conditions et signature électronique par le payeur ' +
            'lorsque celui-ci est distinct du titulaire.',
        },
        {
          title: 'Article 3 — Utilisation du titre',
          body:
            'Le titulaire s’engage à utiliser son titre de transport conformément aux ' +
            'règles en vigueur sur le réseau. Le titre est personnel, nominatif et non ' +
            'cessible. Toute utilisation frauduleuse peut entraîner la suspension du contrat.',
        },
        {
          title: 'Article 4 — Paiement et prélèvement',
          body:
            'Le payeur autorise le prélèvement des sommes dues selon les modalités du ' +
            'produit souscrit. En cas d’incident de paiement, le contrat peut être suspendu ' +
            'jusqu’à régularisation.',
        },
        {
          title: 'Article 5 — Données personnelles',
          body:
            'Conformément aux dispositions légales en vigueur, le titulaire dispose d’un ' +
            'droit d’accès, de rectification et de suppression de ses données personnelles. ' +
            'Pour exercer ces droits, contactez le service client Comutitres.',
        },
        {
          title: 'Article 6 — Service après-vente',
          body:
            'En cas de perte, vol ou dysfonctionnement du support, le titulaire peut ' +
            'solliciter une opposition ou un remplacement selon les tarifs en vigueur. ' +
            'Les démarches sont disponibles en ligne ou en agence.',
        },
      ];

      for (const article of articles) {
        doc.moveDown(0.8);
        doc.fontSize(11).fillColor('#1972D2').text(article.title);
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor('#25303B').text(article.body, {
          align: 'justify',
        });
      }

      doc.moveDown(1.5);
      doc
        .fontSize(9)
        .fillColor('#64B5F6')
        .text(`Référence contrat : ${params.contractId}`);
      doc.text(`Signataire : ${params.signerName}`);
      doc.text(
        `Date de génération : ${new Date().toLocaleDateString('fr-FR')}`,
      );

      doc.moveDown(3);

      // Signature zone
      doc.fontSize(10).fillColor('#25303B').text('Signature du souscripteur :');
      doc.moveDown(0.5);
      doc
        .rect(doc.x, doc.y, 200, 60)
        .strokeColor('#DEEEFF')
        .lineWidth(1)
        .stroke();

      doc.end();
    });
  }
}
