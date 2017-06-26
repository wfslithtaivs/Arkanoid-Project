if [ "$( psql -tAc "SELECT 1 FROM pg_database WHERE datname='games'" )" = '1' ] 
    then 
        dropdb games 
    else 
        echo "DB doesn't exist" 
    fi 

createdb games
echo "DB games created"

if [ -f dump.txt ] 
    then 
        psql games < dump.txt 
        echo "DB data restored from the dump file"
    else 
        python seed.py
        echo "DB data seeded"
    fi
