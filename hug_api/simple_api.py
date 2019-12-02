import hug
import mysql.connector
from hug_middleware_cors import CORSMiddleware
import config
from hash_pass import hash_password, verify_password

api = hug.API(__name__)
api.http.add_middleware(CORSMiddleware(api))

@hug.get('/is-alive')
def is_alive():
    return {'result':'API is alive!'}

@hug.post('/set-password',examples='user=Jake&password=1234')
def set_password(user: hug.types.text, password: hug.types.text):
    if not user_exists(user):
        return {'Error':'User ' + user + ' does not exist'}
    query = 'UPDATE fake_users SET Password = \'' + hash_password(password) + '\' WHERE UserName = \'' + user + '\''
    
    execute_query(query,commit=True)
    
    return {'message':'Password updated for user ' + user + '.'}

@hug.post('/login',examples='user=Jake&password=1234')
def login(user: hug.types.text, password: hug.types.text):
    password_query = 'SELECT Password from fake_users WHERE UserName="' + user + '"'
    stored_password = execute_query(password_query,result=True)
    stored_password = stored_password[0][0]
    return {'message':verify_password(stored_password,password)}

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
    
