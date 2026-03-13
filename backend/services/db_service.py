import pymysql
import pandas as pd
from typing import Optional
from config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, TABLE_NAME

_connection = None

def get_db_connection():
    global _connection
    try:
        if _connection is None or not _connection.open:
            _connection = pymysql.connect(
                host=DB_HOST,
                port=DB_PORT,
                user=DB_USER,
                password=DB_PASSWORD,
                database=DB_NAME,
                cursorclass=pymysql.cursors.DictCursor
            )
        return _connection
    except Exception as e:
        raise Exception(f"Database connection failed: {str(e)}")

def test_connection() -> bool:
    try:
        conn = get_db_connection()
        return conn.open
    except:
        return False

def fetch_data_from_mysql(start_date: Optional[str] = None, end_date: Optional[str] = None) -> pd.DataFrame:
    conn = get_db_connection()

    query = f"SELECT * FROM {TABLE_NAME}"
    conditions = []

    if start_date:
        unix_start = int(pd.Timestamp(start_date).timestamp())
        conditions.append(f"`time@timestamp` >= {unix_start}")
    if end_date:
        unix_end = int(pd.Timestamp(end_date).timestamp())
        conditions.append(f"`time@timestamp` <= {unix_end}")

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY `time@timestamp` ASC"

    df = pd.read_sql(query, conn)
    return df

def close_connection():
    global _connection
    if _connection and _connection.open:
        _connection.close()
        _connection = None