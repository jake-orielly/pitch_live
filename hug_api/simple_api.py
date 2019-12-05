import hug
import mysql.connector
from hug_middleware_cors import CORSMiddleware
import config
from hash_pass import hash_password, verify_password
import random

api = hug.API(__name__)
api.http.add_middleware(CORSMiddleware(api))

@hug.get('/is-alive')
def is_alive():
    return {'result':'API is alive!'}

@hug.post('/sign-up',examples='user=Jake&password=1234')
def sign_up(user: hug.types.text, password: hug.types.text):
    if user_exists(user):
        return {'Error':'That username is not availible.'}

    user_id = random.randint(10**15,10**16-1)

    query = 'INSERT INTO fake_users (UserID,UserName,Password) VALUES (' + str(user_id) + ',"' + user + '","' + hash_password(password) + '")'
    execute_query(query,commit=True)
    
    return {'message':'Account successfully created!'}

@hug.post('/login',examples='user=Jake&password=1234')
def login(user: hug.types.text, password: hug.types.text):
    if (not user_exists(user)):
        return {'message':'bad-user'}
    password_query = 'SELECT Password from fake_users WHERE UserName="' + user + '"'
    stored_password = execute_query(password_query,result=True)
    stored_password = stored_password[0][0]
    if (verify_password(stored_password,password)):
        return {'message':'success'}
    else:
        return {'message':'failure'}
def user_exists(name):
    query = 'SELECT * FROM fake_users WHERE UserName="' + name + '"'
    result = execute_query(query,result=True)

    if (len(result) == 0):
        return False
    else:
        return True

def execute_query(query,commit=False,result=False):
    db = new_db_connection()
    cursor = db.cursor()
    cursor.execute(query)
    if commit:
        db.commit()
    if result:
        return cursor.fetchall()

def new_db_connection():
    db = mysql.connector.connect(
        host="localhost",
        user=config.username,
        passwd=config.password,
        database=config.db
    )

    return db
    
