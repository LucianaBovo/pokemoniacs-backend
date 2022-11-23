CREATE TABLE public.cards (
    id uuid NOT NULL,
    name text NOT NULL,
    picture text NOT NULL,
    condition text NOT NULL,
    price numeric NOT NULL,
    status TEXT NOT NULL,
    "createdAt" timestamp without time zone NOT NULL,
    "updatedAt" timestamp without time zone,
    "userId" uuid NOT NULL
);

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT "userid-fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) NOT VALID;