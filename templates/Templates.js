import { numberToFrench } from '../utils/helpers.js';

export function FactureDevisFooterTemplate(docType, docNumber) {
    return `
    <div style="
      position: fixed;
      bottom:30px;
      left:30px;
      right:30px;
      border-radius: 5px;
      color: black;
      display: flex;
      font-size:15px;
      justify-content: space-between;
    ">
      <div>
        ${docType} #<span class="doc-number">${docNumber}</span>
      </div>
      <div>
        Page <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    </div>
`;
}

export function FactureDevisTemplate({
    docType,
    object,
    mainColor,
    secondColor,
    logo,
    date,
    clientName,
    clientTel,
    clientICE,
    clientAddress,
    userName,
    userEmail,
    docNumber,
    articles,
    userICE,
    userIF,
    userPatente,
    userRC,
    userCNSS,
    userRib,
    userTel,
    userAddress,
    numeroBonCommand,
}) {
    let TotalHt = articles.reduce(
        (previous, current) => previous + current.prixHT * current.quantity,
        0
    );
    let TotalTTC = articles.reduce(
        (previous, current) =>
            previous +
            (current.prixHT + current.prixHT * current.tva) * current.quantity,
        0
    );
    let TotalTVA = TotalTTC - TotalHt;
    TotalHt = parseFloat(TotalHt.toFixed(2));
    TotalTTC = parseFloat(TotalTTC.toFixed(2));
    TotalTVA = parseFloat(TotalTVA.toFixed(2));
    return `
        <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="style.css" />
    <style>
        @import url("https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap");

        :root {
        --main-color: ${mainColor};
        --second-color: ${secondColor};
        }

        * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: "Nunito", sans-serif;
        letter-spacing: 1px;
        }

        html,
        body {
            height: 100%;
        }

        .document {
            height:${Math.ceil(articles.length / 20) * 100}vh;
            display: grid;
            grid-template-rows: ${
                docType != 'Bon de Livraison'
                    ? 'auto auto 1fr auto auto'
                    : 'auto auto 1fr auto'
            };
        }

        .date {
            position: absolute;
            top: 5px;
            right: 20px;
            border-bottom: 1px solid var(--second-color);
            padding-bottom: 2px;
            border-radius: 5px;
            padding: 0 10px;
        }

        .document header {
            display: grid;
            grid-template-columns: 1fr 2fr;
            line-height: 25px;
            align-items: end;
            margin:20px;
            gap:15px
        }

        header .logo {
            height: 120px;
        }

        header .client-info {
            grid-row: 2 span;
            border: 1px solid var(--second-color);
            border-radius: 5px;
            padding: 10px;
            display: grid;
            grid-template-columns: auto 1fr;
            column-gap: 20px;
        }
        .client-info legend {
            font-size: 20px;
            font-weight: bold;
            border-radius: 5px;
            padding: 5px;
            background-color: var(--second-color);
            color: var(--main-color);
        }

        .client-info div {
            position: relative;
        }

        .client-info div::after {
            content: ":";
            position: absolute;
            right: -10px;
        }

        .user-info{
          .user-name{
            text-transform: uppercase;
          }
        }

        .doc-type{
          margin: 30px 0;
          padding: 5px 20px;
          background-color: var(--main-color);
          border-radius: 5px;
          color: white;
          display: flex;
          justify-content: space-between;
        }

        main {
            width: 100%;
        }

        .table-head .row {
            background-color: var(--second-color);
            color: var(--main-color);
            border-radius: 5px;
        }

        .row {
            padding: 5px 10px;
            display: grid;
            grid-template-columns: ${
                docType != 'Bon de Livraison'
                    ? '1fr 100px 85px 50px'
                    : '1fr 100px'
            };
            
            page-break-inside: avoid;
        }
        .row div {
            margin: 2px;
        }

        article div {
            padding-left: 5px;
        }

        article:not(article:last-child) {
            border-bottom: 1px solid var(--second-color);
        }

        .page-break:not(.page-break:last-child) {
          page-break-after: always;
        }

        section.total {
          margin: 40px;
          display: flex;
          justify-content: end;
          text-transform: capitalize;
          font-weight: bold;
        }

        section.total>div{
          border: 2px solid var(--second-color);
          padding: 10px;
          display:grid;
          grid-template-columns : auto auto 1fr;
          column-gap:10px;
          row-gap:5px;
        }

        section.total .textTotal{
            grid-column: span 3;
        }
        
        section.total .price{
          justify-self:end;
        }


        footer {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 50px;
        }

        footer div span , section.total div span {
            font-weight: normal;
            color: var(--main-color);
        }
        
        @page { 
            margin: 20px;
            margin-bottom: 10px;
        }
        
        @right-bottom {
          content: "Page " counter(pageNumber);
        }
    </style>

    <title>${docType} ${docNumber}</title>
  </head>
  <body>
    <div class="document">
      <div class="date">Le <span>${date}</span></div>
      
      <header>
        <img
          src="${logo}"
          alt="Logo"
          class="logo"
        />
        <fieldset class="client-info">
          <legend>Client</legend>
          <div>Nom</div>
          <span class="client-name">${clientName}</span>
          <div>Tel</div>
          <span class="client-tel">${clientTel}</span>
          <div>ICE</div>
          <span class="client-ice">${clientICE}</span>
          <div>Address</div>
          <span class="client-address">${clientAddress}</span>
        </fieldset>
        <div class="user-info">
          <h2 class="user-name">${userName}</h2>
        </div>
      </header>
      <div class="doc-type">
        <h4>
          Objet : <span>${object}</span>
        </h4>
        ${
            numeroBonCommand
                ? `
          <h4>
            BC : <span>${numeroBonCommand}</span>
          </h4>
        `
                : ''
        }
            
        <h4>
          ${docType} #<span class="doc-number">${docNumber}</span>
        </h4>
        
      </div>
      <main>
        <div class="table-head">
          <div class="row">
            <div class="designation">Designation</div>
            <div class="quantity">Quantite</div>
            ${
                docType != 'Bon de Livraison'
                    ? `<div class="prixHT">Prix HT</div>
                  <div class="tva">TVA</div>`
                    : ''
            }
            
          </div>
        </div>
        <div class="table-content">
            ${articles
                .map((article, i) => {
                    const isPageBreak = (i + 1) % 18 == 0;
                    return `
                  <article class="row ${
                      (i != 0) & isPageBreak ? 'page-break' : ''
                  }">
                      <div class="designation">${article.designation}</div>
                      <div class="quantity">${Math.abs(article.quantity)}</div>
                      ${
                          docType != 'Bon de Livraison'
                              ? `
                          <div class="prixHT"><span>${
                              article.prixHT
                          }</span> DH</div>
                          <div class="tva"><span>${
                              article.tva * 100
                          }</span>%</div>
                      `
                              : ''
                      }
                      
                  </article>
                `;
                })
                .join('')}
          
        </div>
      </main>
      ${
          docType != 'Bon de Livraison'
              ? `
        <section class="total">
          <div>
            <div>TOTAL HT</div><span>:</span><span class="price">${TotalHt} DH</span>
            <div>TVA</div><span>:</span><span class="price">${TotalTVA} DH</span>
            <div>TOTAL TTC</div><span>:</span><span class="price">${TotalTTC} DH</span>
            <div class="textTotal"><span>${numberToFrench(
                TotalTTC
            )} Dirham</span></div>
          </div>
        </section>
      `
              : ''
      }
      
      <footer>
      ${
          userICE
              ? `<div class="user-ice">
            ICE : <span>${userICE}</span>
          </div>`
              : ''
      }
      ${
          userIF
              ? `<div class="user-if">
        IF : <span>${userIF}</span>
      </div>`
              : ''
      }
      ${
          userICE
              ? `<div class="user-patente">
            patente : <span>${userPatente}</span>
          </div>`
              : ''
      }
      ${userRC ? `<div class="user-rc">RC : <span>${userRC}</span></div>` : ''}
      ${
          userCNSS
              ? `<div class="user-cnss">CNSS : <span>${userCNSS}</span></div>`
              : ''
      }
      ${
          userRib
              ? `<div class="user-rib">RIB : <span>${userRib}</span></div>`
              : ''
      }
      ${
          userTel
              ? `<div class="user-tel">TEL : <span>${userTel}</span></div>`
              : ''
      }
      ${
          userAddress
              ? `<div class="user-address">ADDRESSE : <span>${userAddress}</span></div>`
              : ''
      }
        <div class="user-email">Email : <span>${userEmail}</span></div>
      </footer>
    </div>
  </body>
</html>
`;
}
