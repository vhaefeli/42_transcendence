#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "transcendence" --dbname "transcendence" <<-EOSQL
-- Database: transcendence

-- DROP DATABASE IF EXISTS transcendence;

CREATE DATABASE transcendence
    WITH
    OWNER = transcendence
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;
EOSQL
