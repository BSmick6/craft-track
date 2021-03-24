const axios = require("axios");
const cheerio = require("cheerio");

let prices = {};

async function generateData() {
  try {
    const response = await axios(
      "https://escapefromtarkov.gamepedia.com/Crafts"
    );
    let crafts = parseSite(response.data);

    let priceRequests = [];
    for (const item in prices) {
      priceRequests.push(
        axios(
          `https://tarkov-market.com/api/v1/item?q=${item}&x-api-key=LzP2rCQzRr4s6Nej`,
          { responseType: "json" }
        )
      );
    }

    priceRequests = await Promise.allSettled(priceRequests);

    for (let resp of priceRequests) {
      if (resp.value) {
        resp = resp.value.data[0];
        if (resp) prices[resp.name] = resp.avg24hPrice;
      }
    }

    for (let craft of crafts) {
      craft.profit =
        prices[craft.product.name] * craft.product.quantity -
        craft.ingredients.reduce(
          (total, item) => total + prices[item.name] * item.quantity,
          0
        );
    }

    crafts.sort((a, b) => b.profit - a.profit);

    return crafts;
  } catch (error) {
    console.log(error);
  }
}

// takes html from crafts page and generates an array of crafts
function parseSite(html) {
  const $ = cheerio.load(html);
  // find all crafts
  return $("tr + tr")
    .get()
    .map((craft) => {
      // extract ingredients
      const ingredients = $("th:nth-of-type(1)", craft)
        .html()
        .split("+")
        .map((item) => {
          const name = $("a:nth-of-type(2)", item).text();
          prices[name] = null;
          return {
            name,
            quantity: item.match(/(?<= x)[0-9]+/)[0],
            icon: $("img", item).attr("src"),
          };
        });

      // extract module
      const module = $("th:nth-of-type(3)", craft).text();

      // extract product
      let product = $("th:nth-of-type(5)", craft);
      product = {
        name: $("a:nth-of-type(2)", product).text(),
        quantity: product.html().match(/(?<= x)[0-9]+/)[0],
        icon: $("img", product).attr("src"),
      };
      prices[product.name] = null;

      return { ingredients, product, module };
    });
}

module.exports = generateData;
