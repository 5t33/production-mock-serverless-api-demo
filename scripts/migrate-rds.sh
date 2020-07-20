
if [ $FLYWAY_ENV == "local" ]; then
  docker run --rm -v $(pwd)/migrations:/flyway/sql flyway/flyway -url=jdbc:postgresql://172.17.0.1:5432/test -user=notadmin -password=notpassword  migrate
else
  username=$(aws ssm get-parameter --name /demo/$FLYWAY_ENV/rds/demo-db-username --with-decryption | jq -r ".Parameter.Value")
  password=$(aws ssm get-parameter --name /demo/$FLYWAY_ENV/rds/demo-db-password --with-decryption | jq -r ".Parameter.Value")
  endpoint=$(aws ssm get-parameter --name /demo/$FLYWAY_ENV/rds/demo-db-endpoint --with-decryption | jq -r ".Parameter.Value")
  name=$(aws ssm get-parameter --name /demo/$FLYWAY_ENV/rds/demo-db-name --with-decryption | jq -r ".Parameter.Value")

  docker run --rm -v $(pwd)/migrations:/flyway/sql flyway/flyway -url=jdbc:postgresql://$endpoint:5432/$name -user=$username -password=$password  migrate
fi