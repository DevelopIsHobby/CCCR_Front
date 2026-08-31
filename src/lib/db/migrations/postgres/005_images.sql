-- sqlite/005_images.sql 과 같은 내용
CREATE TABLE images (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  filename    TEXT    NOT NULL,
  stored_name TEXT    NOT NULL UNIQUE,
  byte_size   INTEGER NOT NULL,
  mime_type   TEXT    NOT NULL,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TEXT    NOT NULL
);
