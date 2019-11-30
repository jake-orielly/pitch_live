import hug
import mysql.connector
from hug_middleware_cors import CORSMiddleware
import config

api = hug.API(__name__)
api.http.add_middleware(CORSMiddleware(api))

@hug.get('/is_alive')
def is_alive():
    return {'result':'API is alive!'}

@hug.get(examples='name=Jake')
@hug.get('/user_exists')
def show_users(name: hug.types.text):
    mydb = mysql.connector.connect(
        host="localhost",
        user=config.username,
        passwd=config.password,
        database=config.db
    )

    cursor = mydb.cursor()

    cursor.execute('SELECT * FROM fake_users WHERE UserName="' + name + '"')

    result = cursor.fetchall()

    if (len(result) == 0):
        return {'message':'User ' + name + ' does not exist.'}
    else:
        return {'message':'User ' + name + ' exists.'}
