--
-- PostgreSQL database dump
--

-- Dumped from database version 13.8 (Ubuntu 13.8-1.pgdg20.04+1)
-- Dumped by pg_dump version 15.0

-- Started on 2022-11-29 19:33:06 CET

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 25 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--
--
-- TOC entry 4124 (class 0 OID 0)
-- Dependencies: 25
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;


CREATE TABLE public.cards (
    id uuid NOT NULL,
    name text NOT NULL,
    picture text NOT NULL,
    condition text NOT NULL,
    price numeric NOT NULL,
    status text NOT NULL,
    "createdAt" timestamp without time zone NOT NULL,
    "updatedAt" timestamp without time zone,
    "userId" uuid NOT NULL,
    series text NOT NULL,
    types text[] NOT NULL,
    "apiId" text NOT NULL
);

CREATE TABLE public.chat_room_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "chatRoomId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    message text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.chat_rooms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "userId1" uuid NOT NULL,
    "userId2" uuid NOT NULL
);

CREATE TABLE public.users (
    id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "createdAt" timestamp without time zone NOT NULL,
    "updatedAt" timestamp without time zone,
    sub text NOT NULL
);

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.chat_room_messages
    ADD CONSTRAINT chat_room_messages_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT chat_rooms_pkey PRIMARY KEY (id);


ALTER TABLE ONLY public.users
    ADD CONSTRAINT "sub-unique" UNIQUE (sub);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.chat_room_messages
    ADD CONSTRAINT "chatRoomId-fkey" FOREIGN KEY ("chatRoomId") REFERENCES public.chat_rooms(id);

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT "userid-fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) NOT VALID;


ALTER TABLE ONLY public.chat_room_messages
    ADD CONSTRAINT "userid-fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT "userid1-fkey" FOREIGN KEY ("userId1") REFERENCES public.users(id);

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT "userid2-fkey" FOREIGN KEY ("userId2") REFERENCES public.users(id);


REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


