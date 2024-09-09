CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    created_at DATE DEFAULT (datetime('now','localtime'))
);

INSERT INTO documents
    (title, content)
VALUES
    ('New Document', 'Add Content..')
;
