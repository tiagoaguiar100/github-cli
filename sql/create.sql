CREATE TABLE IF NOT EXISTS public."User"
(
    id text NOT NULL,
    name text,
    location text,
    languages text[],
    CONSTRAINT "User_pkey" PRIMARY KEY (id)
)