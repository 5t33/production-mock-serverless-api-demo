create table a_schema.locations (
  id SERIAL PRIMARY KEY,
  user_id SERIAL REFERENCES a_schema.users(id) ON DELETE CASCADE,
  country VARCHAR(300)
); 