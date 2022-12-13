import requests
from bs4 import BeautifulSoup
import pandas as pd
import sqlite3
from ftplib import FTP

conn = sqlite3.connect('products.db')
c = conn.cursor()
c.execute('''DROP TABLE IF EXISTS products''')
c.execute('''CREATE TABLE IF NOT EXISTS products (id TEXT, product_name TEXT, product_sub_title TEXT,product_description TEXT, main_category TEXT,sub_category TEXT, price REAL,link TEXT, overall_rating REAL)''')
c.execute('''DROP TABLE IF EXISTS product_images''')
c.execute('''DROP TABLE IF EXISTS products_additional_info''')
c.execute('''CREATE TABLE IF NOT EXISTS product_images (product_id TEXT, image_url TEXT, alt_text TEXT, additional_info VARCHAR)''')
c.execute('''CREATE TABLE IF NOT EXISTS products_additional_info (product_id TEXT, choices VARCHAR, additional_info TEXT)''')

baseurl = "https://www.thewhiskyexchange.com"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'}
productlinks = []
t = {}
data = []
c2 = 0
for x in range(1, 6):
    k = requests.get(
        'https://www.thewhiskyexchange.com/c/35/japanese-whisky?pg={}&psize=24&sort=pasc'.format(x)).text
    soup = BeautifulSoup(k, 'html.parser')
    productlist = soup.find_all("li", {"class": "product-grid__item"})
# Get a link for each product from the product list
    for product in productlist:
        link = product.find("a", {"class": "product-card"}).get('href')
        productlinks.append(baseurl + link)

for link in productlinks:
    f = requests.get(link, headers=headers).text
    hun = BeautifulSoup(f, 'html.parser')

    # Price
    try:
        price_find = hun.find(
            "p", {"class": "product-action__price"}).text.replace('\n', "")
        price = price_find.split("£")[1]
    except:
        price = None
    if price is None:
        price = ""

    # Additional_info - PRODUCT ADDITIONAL INFO TABLE - IN STOCK OR NOT
    try:
        product_additional_info = hun.find(
            "p", {"class": "product-action__stock-flag"}).text.replace('\n', "")
    except:
        product_additional_info = None
    if product_additional_info is None:
        product_additional_info = ""

    # Description
    try:
        product_description = hun.find(
            "div", {"class": "product-main__description"}).text.replace('\n', "")
    except:
        product_description = None
    if product_description is None:
        product_description = ""
        # Overall rating
    try:
        overall_rating_find = hun.find(
            "div", {"class": "review-overview"}).text.replace('\n', "")
        overall_rating = overall_rating_find.split("(")[0]
    except:
        overall_rating = None
    if overall_rating is None:
        overall_rating = ""
# Product_name
    try:
        product_name = hun.find(
            "h1", {"class": "product-main__name"}).text.replace('\n', "")
    except:
        product_name = None
    if product_name is None:
        product_name = ""
    # product_sub_title
    try:
        ul_tag = hun.find("ul", {"class": "product-main__meta"})
        product_sub_title = ul_tag.find("li").text.replace('\n', "")
    except:
        product_sub_title = None
    if product_sub_title is None:
        product_sub_title = ""
    # Category
    try:
        main_list = hun.find("ul", {"class": "breadcrumb__list"})
        sibling = main_list.find("li")
        main_category = sibling.find_next_sibling("li").text.replace('\n', "")

    except:
        main_category = None
    if main_category is None:
        main_category = ""

    # Subcategory
    try:
        main_list = hun.find("ul", {"class": "breadcrumb__list"})
        sibling = main_list.find("li")
        category = sibling.find_next_sibling("li")
        sub_category = category.find_next_sibling("li").text.replace('\n', "")
        
    except:
        sub_category = None
    if sub_category is None:
        sub_category = ""

# Product ID
    try:
        id = hun.find("input", {"id": "productID"}).get('value')
    except:
        id = None

    if id is None:
        id = ""

    # Image_url
    try:
        image_url = hun.find(
            "img", {"class": "product-main__image"}).get('src')

    except:
        image_url = None

    if image_url is None:
        image_url = ""

    # Product image Additional info
    try:
        product_images_additional_info = hun.find(
            "img", {"class": "product-main__image"}).get('href')
    except:
        product_images_additional_info = None
    if product_images_additional_info is None:
        product_images_additional_info = ""

    # Alt text
    try:
        alt_text = hun.find("img", {"class": "product-main__image"}).get('alt')
    except:
        alt_text = None

    if alt_text is None:
        alt_text = ""

    # CHOICES - PRODUCT ADDITIONAL INFO TABLE % of alcohol
    try:
        additional_info = hun.find(
            "p", {"class": "product-main__data"}).text.replace('\n', "")
    except:
        additional_info = None
    if additional_info is None:
        additional_info = ""


    whisky = {"id": id, "link": link, "product_name": product_name, "price": price, "overall_rating": overall_rating, "product_description": product_description, "product_sub_title": product_sub_title,
              "main_category": main_category, "sub_category": sub_category, "additional_info": additional_info, "image_url": image_url, "alt_text": alt_text}
    data.append(whisky)
    

    c.execute('''INSERT INTO products VALUES(?,?,?,?,?,?,?,?,?)''', (id, product_name, product_sub_title,
              product_description, main_category, sub_category, price, link, overall_rating))
    
    c.execute('''INSERT INTO product_images VALUES(?,?,?,?)''',
              (id, image_url, alt_text, product_images_additional_info))

    c.execute('''INSERT INTO products_additional_info VALUES(?,?,?)''',
              (id, additional_info, product_additional_info))


df = pd.DataFrame(data)
print(df)
conn.commit()
conn.close()

ftp = FTP('127.0.0.1')  # connect to host, default port
ftp.login(user='user', passwd='12345')
ftp.cwd('ass')  # change into directory
ftp.retrlines('LIST')  # list directory contents
with open('test.txt', 'wb') as fp:
    print(fp)
    ftp.retrbinary('RETR test.txt', fp.write)  # download file to fp
print(ftp.getwelcome())  # print welcome message
ftp.quit()
