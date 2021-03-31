from sys import setprofile
from flask_cors import CORS
from flask import Flask, jsonify
from bs4 import BeautifulSoup
import re
from flask.helpers import make_response
import requests
import pprint
pp = pprint.PrettyPrinter()
app = Flask(__name__)
CORS(app)


class Item:
    def __init__(self, tag):
        anchors = tag.find_all('a')
        self.icon = anchors[0].find("img")["src"]
        self.quantity = int(
            re.search(r"[0-9]+", anchors[0].next_sibling).group())
        self.name = str(anchors[1].string)
        prices[self.name] = None

    def serialize(self):
        return {
            "name": self.name,
            "quantity": self.quantity,
            "icon": self.icon
        }


class Craft:
    def __init__(self, product, ingredients, module, time):
        self.product = product
        self.ingredients = ingredients
        self.module = module
        self.time = time

    def calculateProfit(self):
        cost = 0
        for item in self.ingredients:
            if prices[item.name]:
                cost += prices[item.name] * item.quantity
            else:
                print(f"no price info for {item.name}")
                cost = 999999
        if (prices[self.product.name]):
            self.profit = prices[self.product.name] * \
                self.product.quantity - cost
        else:
            self.profit = 0 - cost
            print(f"no price info for {self.product.name}")
        self.profitRate = round(self.profit / self.time, 2)

    def serialize(self):
        return {
            "product": self.product.serialize(),
            "ingredients": [item.serialize() for item in self.ingredients],
            "module": self.module,
            "time": self.time,
            "profit": self.profit,
            "profitRate": self.profitRate
        }


r = requests.get("https://escapefromtarkov.fandom.com/wiki/Crafts")
soup = BeautifulSoup(r.content, 'html.parser')
r.close()
crafts = soup.select("tr + tr")
prices = {}
done = False


def extractCraft(craft):
    formula = craft.find_all("th")
    product = Item(formula[4])
    module = formula[2].find('a').string
    time = str(formula[2].contents[2])
    hours = re.search(r"[0-9]+(?=\sh)", time)
    time = int(hours.group()) if hours else 0 + \
        int(re.search(r"[0-9]+(?=\smin)", time).group()) / 60
    ingredients = str(formula[0]).split("+")
    ingredients = list(map(lambda item: Item(
        BeautifulSoup(item, 'html.parser')), ingredients))
    return Craft(product, ingredients, module, time)


crafts = list(map(extractCraft, crafts))

for item in prices:
    r = requests.get(
        f"https://tarkov-market.com/api/v1/item?q={item}&x-api-key=LzP2rCQzRr4s6Nej")
    if r.json() and 'avg24hPrice' in r.json()[0]:
        prices[item] = r.json()[0]['avg24hPrice']
    else:
        print(f"unable to retrieve price of {item}")
        prices[item] = 0
    r.close()

for craft in crafts:
    craft.calculateProfit()


def sortFunc(craft):
    return craft.profitRate or 0


crafts.sort(key=sortFunc, reverse=True)
done = True


@app.route('/crafts')
def get_crafts():
    json_crafts = [craft.serialize() for craft in crafts]
    return jsonify(json_crafts)


@app.route('/prices')
def get_prices():
    print()
    response = make_response(prices)
    print(response)

    return response
