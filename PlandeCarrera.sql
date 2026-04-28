--
-- PostgreSQL database dump
--

\restrict UnGMiO5C3wXJ8KbRaAjYW002ikMFarRwR38KCWpJosfkKUd4Mi18MCFpwSeUCEG

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg13+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cache; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO laravel;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO laravel;

--
-- Name: cargos; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.cargos (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    dedicacion_id bigint NOT NULL,
    nro_materias_asig integer NOT NULL,
    sum_horas_frente_aula integer NOT NULL,
    docente_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT nombre_enum_check CHECK (((nombre)::text = ANY ((ARRAY['Titular'::character varying, 'Asociado'::character varying, 'Adjunto'::character varying, 'Jefe de Trabajos Practicos'::character varying, 'Ayudante de Primera'::character varying])::text[])))
);


ALTER TABLE public.cargos OWNER TO laravel;

--
-- Name: cargos_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.cargos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cargos_id_seq OWNER TO laravel;

--
-- Name: cargos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.cargos_id_seq OWNED BY public.cargos.id;


--
-- Name: carreras; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.carreras (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    instituto_id bigint NOT NULL,
    modalidad character varying(255) NOT NULL,
    sede character varying(255) NOT NULL,
    estado boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT carreras_modalidad_check CHECK (((modalidad)::text = ANY ((ARRAY['presencial'::character varying, 'virtual'::character varying, 'mixta'::character varying])::text[]))),
    CONSTRAINT carreras_sede_check CHECK (((sede)::text = ANY ((ARRAY['Ushuaia'::character varying, 'Rio Grande'::character varying, 'Ushuaia/Rio Grande'::character varying])::text[])))
);


ALTER TABLE public.carreras OWNER TO laravel;

--
-- Name: carreras_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.carreras_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carreras_id_seq OWNER TO laravel;

--
-- Name: carreras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.carreras_id_seq OWNED BY public.carreras.id;


--
-- Name: comisiones; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.comisiones (
    id bigint NOT NULL,
    codigo character varying(255) NOT NULL,
    nombre character varying(255) NOT NULL,
    turno character varying(255) NOT NULL,
    modalidad character varying(255) NOT NULL,
    sede character varying(255) NOT NULL,
    anio integer NOT NULL,
    horas_teoricas integer NOT NULL,
    horas_practicas integer NOT NULL,
    horas_totales integer NOT NULL,
    estado boolean NOT NULL,
    id_materia bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    cuatrimestre character varying(255) NOT NULL,
    CONSTRAINT comisiones_cuatrimestre_check CHECK (((cuatrimestre)::text = ANY ((ARRAY['1ro'::character varying, '2do'::character varying])::text[]))),
    CONSTRAINT comisiones_modalidad_check CHECK (((modalidad)::text = ANY ((ARRAY['presencial'::character varying, 'virtual'::character varying, 'mixta'::character varying])::text[])))
);


ALTER TABLE public.comisiones OWNER TO laravel;

--
-- Name: comisiones_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.comisiones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comisiones_id_seq OWNER TO laravel;

--
-- Name: comisiones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.comisiones_id_seq OWNED BY public.comisiones.id;


--
-- Name: coordinador_carreras; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.coordinador_carreras (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    carrera_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.coordinador_carreras OWNER TO laravel;

--
-- Name: coordinador_carreras_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.coordinador_carreras_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coordinador_carreras_id_seq OWNER TO laravel;

--
-- Name: coordinador_carreras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.coordinador_carreras_id_seq OWNED BY public.coordinador_carreras.id;


--
-- Name: dedicaciones; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.dedicaciones (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    horas_frente_aula_min integer NOT NULL,
    horas_frente_aula_max integer NOT NULL,
    nro_materias_max integer NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT dedicaciones_nombre_check CHECK (((nombre)::text = ANY ((ARRAY['Simple'::character varying, 'SemiExclusiva(DP)'::character varying, 'SemiExclusiva(DI)'::character varying, 'Exclusiva'::character varying])::text[])))
);


ALTER TABLE public.dedicaciones OWNER TO laravel;

--
-- Name: dedicaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.dedicaciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dedicaciones_id_seq OWNER TO laravel;

--
-- Name: dedicaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.dedicaciones_id_seq OWNED BY public.dedicaciones.id;


--
-- Name: dictas; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.dictas (
    id bigint NOT NULL,
    docente_id bigint NOT NULL,
    cargo_id bigint NOT NULL,
    comision_id bigint NOT NULL,
    ano_inicio date NOT NULL,
    "año_fin" date,
    funcion_aulica_id bigint NOT NULL,
    modalidad_presencia character varying(255) NOT NULL,
    horas_frente_aula integer NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT dictas_modalidad_presencia_check CHECK (((modalidad_presencia)::text = ANY ((ARRAY['presencial'::character varying, 'virtual'::character varying, 'mixta'::character varying])::text[])))
);


ALTER TABLE public.dictas OWNER TO laravel;

--
-- Name: dictas_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.dictas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dictas_id_seq OWNER TO laravel;

--
-- Name: dictas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.dictas_id_seq OWNED BY public.dictas.id;


--
-- Name: docentes; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.docentes (
    id bigint NOT NULL,
    legajo integer NOT NULL,
    nombre character varying(255) NOT NULL,
    apellido character varying(255) NOT NULL,
    "modalidad_desempeño" character varying(255) NOT NULL,
    carga_horaria integer NOT NULL,
    es_activo boolean NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    telefono character varying(50),
    email character varying(255),
    CONSTRAINT "docentes_modalidad_desempeño_check" CHECK ((("modalidad_desempeño")::text = ANY ((ARRAY['Investigador'::character varying, 'Desarrollo'::character varying])::text[])))
);


ALTER TABLE public.docentes OWNER TO laravel;

--
-- Name: docentes_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.docentes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.docentes_id_seq OWNER TO laravel;

--
-- Name: docentes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.docentes_id_seq OWNED BY public.docentes.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO laravel;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO laravel;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: funciones_aulicas; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.funciones_aulicas (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.funciones_aulicas OWNER TO laravel;

--
-- Name: funciones_aulicas_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.funciones_aulicas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.funciones_aulicas_id_seq OWNER TO laravel;

--
-- Name: funciones_aulicas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.funciones_aulicas_id_seq OWNED BY public.funciones_aulicas.id;


--
-- Name: horarios; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.horarios (
    id bigint NOT NULL,
    comision_id bigint NOT NULL,
    dia_semana character varying(255) NOT NULL,
    hora_inicio time(0) without time zone NOT NULL,
    hora_fin time(0) without time zone NOT NULL,
    aula character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT horarios_dia_semana_check CHECK (((dia_semana)::text = ANY ((ARRAY['lunes'::character varying, 'martes'::character varying, 'miercoles'::character varying, 'jueves'::character varying, 'viernes'::character varying, 'sabado'::character varying])::text[])))
);


ALTER TABLE public.horarios OWNER TO laravel;

--
-- Name: horarios_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.horarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.horarios_id_seq OWNER TO laravel;

--
-- Name: horarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.horarios_id_seq OWNED BY public.horarios.id;


--
-- Name: institutos; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.institutos (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    siglas character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.institutos OWNER TO laravel;

--
-- Name: institutos_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.institutos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.institutos_id_seq OWNER TO laravel;

--
-- Name: institutos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.institutos_id_seq OWNED BY public.institutos.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO laravel;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO laravel;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO laravel;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: materias; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.materias (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    codigo character varying(255) NOT NULL,
    estado boolean DEFAULT true NOT NULL,
    regimen character varying(255) NOT NULL,
    cuatrimestre integer,
    horas_semanales integer NOT NULL,
    horas_totales integer NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT materias_regimen_check CHECK (((regimen)::text = ANY ((ARRAY['anual'::character varying, 'cuatrimestral'::character varying])::text[])))
);


ALTER TABLE public.materias OWNER TO laravel;

--
-- Name: materias_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.materias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.materias_id_seq OWNER TO laravel;

--
-- Name: materias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.materias_id_seq OWNED BY public.materias.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO laravel;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO laravel;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: model_has_permissions; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.model_has_permissions (
    permission_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


ALTER TABLE public.model_has_permissions OWNER TO laravel;

--
-- Name: model_has_roles; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.model_has_roles (
    role_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


ALTER TABLE public.model_has_roles OWNER TO laravel;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO laravel;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.permissions OWNER TO laravel;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO laravel;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO laravel;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_access_tokens_id_seq OWNER TO laravel;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: plan_materia; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.plan_materia (
    plan_id bigint NOT NULL,
    materia_id bigint NOT NULL
);


ALTER TABLE public.plan_materia OWNER TO laravel;

--
-- Name: planes; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.planes (
    id bigint NOT NULL,
    carrera_id bigint NOT NULL,
    anio_comienzo date NOT NULL,
    anio_fin date,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.planes OWNER TO laravel;

--
-- Name: planes_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.planes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.planes_id_seq OWNER TO laravel;

--
-- Name: planes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.planes_id_seq OWNED BY public.planes.id;


--
-- Name: role_has_permissions; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.role_has_permissions (
    permission_id bigint NOT NULL,
    role_id bigint NOT NULL
);


ALTER TABLE public.role_has_permissions OWNER TO laravel;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.roles OWNER TO laravel;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO laravel;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO laravel;

--
-- Name: users; Type: TABLE; Schema: public; Owner: laravel
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    dni bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    apellido character varying(255) NOT NULL,
    is_activo boolean DEFAULT true NOT NULL,
    cargo character varying(255) NOT NULL,
    instituto_id bigint,
    CONSTRAINT users_cargo_check CHECK (((cargo)::text = ANY ((ARRAY['Administrador'::character varying, 'Administrativo de Secretaria Academica'::character varying, 'Administrativo de instituto'::character varying, 'Coordinador de Carrera'::character varying, 'Director de instituto'::character varying, 'Coordinador Academico'::character varying, 'Consejero'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO laravel;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: laravel
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO laravel;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: laravel
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: cargos id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.cargos ALTER COLUMN id SET DEFAULT nextval('public.cargos_id_seq'::regclass);


--
-- Name: carreras id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.carreras ALTER COLUMN id SET DEFAULT nextval('public.carreras_id_seq'::regclass);


--
-- Name: comisiones id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.comisiones ALTER COLUMN id SET DEFAULT nextval('public.comisiones_id_seq'::regclass);


--
-- Name: coordinador_carreras id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.coordinador_carreras ALTER COLUMN id SET DEFAULT nextval('public.coordinador_carreras_id_seq'::regclass);


--
-- Name: dedicaciones id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.dedicaciones ALTER COLUMN id SET DEFAULT nextval('public.dedicaciones_id_seq'::regclass);


--
-- Name: dictas id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.dictas ALTER COLUMN id SET DEFAULT nextval('public.dictas_id_seq'::regclass);


--
-- Name: docentes id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.docentes ALTER COLUMN id SET DEFAULT nextval('public.docentes_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: funciones_aulicas id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.funciones_aulicas ALTER COLUMN id SET DEFAULT nextval('public.funciones_aulicas_id_seq'::regclass);


--
-- Name: horarios id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.horarios ALTER COLUMN id SET DEFAULT nextval('public.horarios_id_seq'::regclass);


--
-- Name: institutos id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.institutos ALTER COLUMN id SET DEFAULT nextval('public.institutos_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: materias id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.materias ALTER COLUMN id SET DEFAULT nextval('public.materias_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: planes id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.planes ALTER COLUMN id SET DEFAULT nextval('public.planes_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.cache (key, value, expiration) FROM stdin;
laravel-cache-coordinador@domain.com|172.18.0.1:timer	i:1776790084;	1776790084
laravel-cache-coordinador@domain.com|172.18.0.1	i:1;	1776790084
laravel-cache-spatie.permission.cache	a:3:{s:5:"alias";a:4:{s:1:"a";s:2:"id";s:1:"b";s:4:"name";s:1:"c";s:10:"guard_name";s:1:"r";s:5:"roles";}s:11:"permissions";a:21:{i:0;a:4:{s:1:"a";i:1;s:1:"b";s:13:"crear_usuario";s:1:"c";s:3:"web";s:1:"r";a:1:{i:0;i:1;}}i:1;a:4:{s:1:"a";i:2;s:1:"b";s:17:"consultar_usuario";s:1:"c";s:3:"web";s:1:"r";a:2:{i:0;i:1;i:1;i:2;}}i:2;a:4:{s:1:"a";i:3;s:1:"b";s:17:"modificar_usuario";s:1:"c";s:3:"web";s:1:"r";a:2:{i:0;i:1;i:1;i:2;}}i:3;a:4:{s:1:"a";i:4;s:1:"b";s:15:"restore_usuario";s:1:"c";s:3:"web";s:1:"r";a:2:{i:0;i:1;i:1;i:2;}}i:4;a:4:{s:1:"a";i:5;s:1:"b";s:18:"modificar_permisos";s:1:"c";s:3:"web";s:1:"r";a:2:{i:0;i:1;i:1;i:2;}}i:5;a:4:{s:1:"a";i:6;s:1:"b";s:13:"crear_carrera";s:1:"c";s:3:"web";s:1:"r";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:6;a:4:{s:1:"a";i:7;s:1:"b";s:17:"consultar_carrera";s:1:"c";s:3:"web";s:1:"r";a:5:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;}}i:7;a:4:{s:1:"a";i:8;s:1:"b";s:17:"modificar_carrera";s:1:"c";s:3:"web";s:1:"r";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;}}i:8;a:4:{s:1:"a";i:9;s:1:"b";s:15:"restore_carrera";s:1:"c";s:3:"web";s:1:"r";a:2:{i:0;i:1;i:1;i:2;}}i:9;a:4:{s:1:"a";i:10;s:1:"b";s:13:"crear_docente";s:1:"c";s:3:"web";s:1:"r";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:10;a:4:{s:1:"a";i:11;s:1:"b";s:17:"consultar_docente";s:1:"c";s:3:"web";s:1:"r";a:5:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;}}i:11;a:4:{s:1:"a";i:12;s:1:"b";s:17:"modificar_docente";s:1:"c";s:3:"web";s:1:"r";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:12;a:4:{s:1:"a";i:13;s:1:"b";s:15:"restore_docente";s:1:"c";s:3:"web";s:1:"r";a:2:{i:0;i:1;i:1;i:2;}}i:13;a:4:{s:1:"a";i:14;s:1:"b";s:13:"crear_materia";s:1:"c";s:3:"web";s:1:"r";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:14;a:4:{s:1:"a";i:15;s:1:"b";s:17:"consultar_materia";s:1:"c";s:3:"web";s:1:"r";a:5:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;}}i:15;a:4:{s:1:"a";i:16;s:1:"b";s:17:"modificar_materia";s:1:"c";s:3:"web";s:1:"r";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;}}i:16;a:4:{s:1:"a";i:17;s:1:"b";s:15:"restore_materia";s:1:"c";s:3:"web";s:1:"r";a:2:{i:0;i:1;i:1;i:2;}}i:17;a:4:{s:1:"a";i:18;s:1:"b";s:14:"crear_comision";s:1:"c";s:3:"web";s:1:"r";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;}}i:18;a:4:{s:1:"a";i:19;s:1:"b";s:18:"consultar_comision";s:1:"c";s:3:"web";s:1:"r";a:5:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;}}i:19;a:4:{s:1:"a";i:20;s:1:"b";s:18:"modificar_comision";s:1:"c";s:3:"web";s:1:"r";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;}}i:20;a:4:{s:1:"a";i:21;s:1:"b";s:16:"restore_comision";s:1:"c";s:3:"web";s:1:"r";a:2:{i:0;i:1;i:1;i:2;}}}s:5:"roles";a:5:{i:0;a:3:{s:1:"a";i:1;s:1:"b";s:5:"Admin";s:1:"c";s:3:"web";}i:1;a:3:{s:1:"a";i:2;s:1:"b";s:12:"Admin_global";s:1:"c";s:3:"web";}i:2;a:3:{s:1:"a";i:3;s:1:"b";s:15:"Admin_instituto";s:1:"c";s:3:"web";}i:3;a:3:{s:1:"a";i:4;s:1:"b";s:13:"Coord_carrera";s:1:"c";s:3:"web";}i:4;a:3:{s:1:"a";i:5;s:1:"b";s:18:"Consulta_instituto";s:1:"c";s:3:"web";}}}	1777378810
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: cargos; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.cargos (id, nombre, dedicacion_id, nro_materias_asig, sum_horas_frente_aula, docente_id, created_at, updated_at) FROM stdin;
1	Jefe de Trabajos Practicos	2	3	10	1	2026-04-21 16:46:25	2026-04-21 16:46:25
2	Ayudante de Primera	1	2	8	2	2026-04-21 16:46:25	2026-04-21 16:46:25
3	Ayudante de Primera	1	2	8	3	2026-04-21 16:46:25	2026-04-21 16:46:25
4	Ayudante de Primera	1	2	8	4	2026-04-21 16:46:25	2026-04-21 16:46:25
5	Ayudante de Primera	1	1	3	5	2026-04-21 16:46:25	2026-04-21 16:46:25
6	Jefe de Trabajos Practicos	2	2	11	6	2026-04-21 16:46:25	2026-04-21 16:46:25
7	Adjunto	2	2	11	7	2026-04-21 16:46:25	2026-04-21 16:46:25
8	Jefe de Trabajos Practicos	1	2	9	8	2026-04-21 16:46:25	2026-04-21 16:46:25
9	Jefe de Trabajos Practicos	2	2	5	9	2026-04-21 16:46:25	2026-04-21 16:46:25
10	Adjunto	4	1	10	10	2026-04-21 16:46:25	2026-04-21 16:46:25
11	Asociado	4	3	13	11	2026-04-21 16:46:25	2026-04-21 16:46:25
12	Asociado	4	3	16	12	2026-04-21 16:46:25	2026-04-21 16:46:25
13	Adjunto	2	1	5	13	2026-04-21 16:46:25	2026-04-21 16:46:25
14	Adjunto	2	2	7	14	2026-04-21 16:46:25	2026-04-21 16:46:25
15	Adjunto	2	2	9	15	2026-04-21 16:46:25	2026-04-21 16:46:25
16	Asociado	4	3	8	16	2026-04-21 16:46:25	2026-04-21 16:46:25
17	Asociado	2	3	10	17	2026-04-21 16:46:25	2026-04-21 16:46:25
18	Adjunto	2	2	8	18	2026-04-21 16:46:25	2026-04-21 16:46:25
19	Adjunto	2	3	14	19	2026-04-21 16:46:25	2026-04-21 16:46:25
20	Adjunto	2	2	10	20	2026-04-21 16:46:25	2026-04-21 16:46:25
21	Adjunto	2	3	12	21	2026-04-21 16:46:25	2026-04-21 16:46:25
22	Adjunto	2	2	7	22	2026-04-21 16:46:25	2026-04-21 16:46:25
23	Adjunto	1	2	7	23	2026-04-21 16:46:25	2026-04-21 16:46:25
24	Adjunto	1	1	0	24	2026-04-21 16:46:25	2026-04-21 16:46:25
25	Adjunto	1	3	7	25	2026-04-21 16:46:25	2026-04-21 16:46:25
26	Adjunto	1	1	0	26	2026-04-21 16:46:25	2026-04-21 16:46:25
27	Adjunto	1	1	3	27	2026-04-21 16:46:25	2026-04-21 16:46:25
28	Adjunto	1	2	6	28	2026-04-21 16:46:25	2026-04-21 16:46:25
29	Adjunto	4	1	2	29	2026-04-21 16:46:25	2026-04-21 16:46:25
30	Ayudante de Primera	1	2	7	30	2026-04-21 16:46:25	2026-04-21 16:46:25
31	Jefe de Trabajos Practicos	1	2	6	31	2026-04-21 16:46:25	2026-04-21 16:46:25
32	Jefe de Trabajos Practicos	1	2	4	32	2026-04-21 16:46:25	2026-04-21 16:46:25
33	Jefe de Trabajos Practicos	1	2	9	33	2026-04-21 16:46:25	2026-04-21 16:46:25
34	Jefe de Trabajos Practicos	1	2	4	34	2026-04-21 16:46:25	2026-04-21 16:46:25
35	Ayudante de Primera	1	2	8	35	2026-04-21 16:46:25	2026-04-21 16:46:25
36	Jefe de Trabajos Practicos	1	1	5	36	2026-04-21 16:46:25	2026-04-21 16:46:25
\.


--
-- Data for Name: carreras; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.carreras (id, nombre, instituto_id, modalidad, sede, estado, created_at, updated_at) FROM stdin;
1	Licenciatura en Sistemas	1	presencial	Ushuaia	t	2026-04-21 16:46:25	2026-04-21 16:46:25
\.


--
-- Data for Name: comisiones; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.comisiones (id, codigo, nombre, turno, modalidad, sede, anio, horas_teoricas, horas_practicas, horas_totales, estado, id_materia, created_at, updated_at, cuatrimestre) FROM stdin;
1	IF001-T-2025	Elementos de Informática - Tarde	Tarde	presencial	Ushuaia	2026	3	4	7	t	1	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
2	IF002-T-2025	Expresión de Problemas y Algoritmos - Tarde	Tarde	presencial	Ushuaia	2026	3	3	6	t	2	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
3	MA045-T-2025	Algebra - Tarde	Tarde	presencial	Ushuaia	2026	4	5	9	t	3	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
4	FA007-T-2025	Acreditación de Idioma Inglés - Tarde	Tarde	presencial	Ushuaia	2026	0	0	0	t	35	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
5	IF003-T-2025	Algorítmica y Programación I - Tarde	Tarde	presencial	Ushuaia	2026	4	4	8	t	4	2026-04-21 16:46:25	2026-04-21 16:46:25	2do
6	MA008-T-2025	Elementos de Lógica y Matemática Discreta - Tarde	Tarde	presencial	Ushuaia	2026	4	4	8	t	5	2026-04-21 16:46:25	2026-04-21 16:46:25	2do
7	MA046-T-2025	Análisis Matemático - Tarde	Tarde	presencial	Ushuaia	2026	5	6	11	t	6	2026-04-21 16:46:25	2026-04-21 16:46:25	2do
8	IF004-T-2025	Sistemas y Organizaciones - Tarde	Tarde	presencial	Ushuaia	2026	3	3	6	t	7	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
9	IF005-T-2025	Arquitectura de Computadoras - Tarde	Tarde	presencial	Ushuaia	2026	4	4	8	t	8	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
10	IF006-T-2025	Algorítmica y Programación II - Tarde	Tarde	presencial	Ushuaia	2026	4	4	8	t	9	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
11	MA006-T-2025	Estadística - Tarde	Tarde	presencial	Ushuaia	2026	3	3	6	t	10	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
12	IF007-T-2025	Bases de Datos I - Tarde	Tarde	presencial	Ushuaia	2026	4	5	9	t	11	2026-04-21 16:46:25	2026-04-21 16:46:25	2do
13	IF030-T-2025	Programación y Diseño Orientado a Objetos - Tarde	Tarde	presencial	Ushuaia	2026	4	4	8	t	12	2026-04-21 16:46:25	2026-04-21 16:46:25	2do
14	IF031-T-2025	Ingeniería de Software I - Tarde	Tarde	presencial	Ushuaia	2026	5	5	10	t	13	2026-04-21 16:46:25	2026-04-21 16:46:25	2do
15	IF009-T-2025	Laboratorio de Programación y Lenguajes - Tarde	Tarde	presencial	Ushuaia	2026	3	3	6	t	14	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
16	IF013-T-2025	Fundamentos Teóricos de Informática - Tarde	Tarde	presencial	Ushuaia	2026	4	4	8	t	15	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
17	IF033-T-2025	Ingeniería de Software II - Tarde	Tarde	presencial	Ushuaia	2026	4	4	8	t	16	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
18	IF038-T-2025	Introducción a la Concurrencia - Tarde	Tarde	presencial	Ushuaia	2026	2	2	4	t	17	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
19	IF044-T-2025	Bases de Datos II - Tarde	Tarde	presencial	Ushuaia	2026	4	4	8	t	18	2026-04-21 16:46:25	2026-04-21 16:46:25	2do
20	IF037-T-2025	Sistemas Operativos - Tarde	Tarde	presencial	Ushuaia	2026	4	4	8	t	19	2026-04-21 16:46:25	2026-04-21 16:46:25	2do
21	IF055-T-2025	Laboratorio de Software - Tarde	Tarde	presencial	Ushuaia	2026	3	4	7	t	20	2026-04-21 16:46:25	2026-04-21 16:46:25	2do
22	IF056-T-2025	Seminario de Aspectos Legales y Profesionales I - Tarde	Tarde	presencial	Ushuaia	2026	2	2	4	t	21	2026-04-21 16:46:25	2026-04-21 16:46:25	2do
23	IF019-T-2025	Redes y Transmisión de Datos - Tarde	Tarde	presencial	Ushuaia	2026	4	5	9	t	22	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
24	IF020-T-2025	Paradigmas y Lenguajes de Programación - Tarde	Tarde	presencial	Ushuaia	2026	4	4	8	t	23	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
25	IF017-T-2025	Taller de nuevas Tecnologías - Tarde	Tarde	presencial	Ushuaia	2026	3	3	6	t	24	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
26	IF022-T-2025	Sistemas Distribuidos - Tarde	Tarde	presencial	Ushuaia	2026	4	4	8	t	25	2026-04-21 16:46:25	2026-04-21 16:46:25	2do
27	IF035-T-2025	Ingeniería de Software III - Tarde	Tarde	presencial	Ushuaia	2026	4	4	8	t	26	2026-04-21 16:46:25	2026-04-21 16:46:25	2do
28	IF057-T-2025	Seminario de Aspectos Legales y Profesionales II - Tarde	Tarde	presencial	Ushuaia	2026	2	2	4	t	27	2026-04-21 16:46:25	2026-04-21 16:46:25	2do
29	IF059-T-2025	Sistemas Inteligentes - Tarde	Tarde	presencial	Ushuaia	2026	3	3	6	t	28	2026-04-21 16:46:25	2026-04-21 16:46:25	2do
30	IF060-T-2025	Sistemas de Tiempo Real - Tarde	Tarde	presencial	Ushuaia	2026	4	3	7	t	29	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
31	IF061-T-2025	Sistemas Paralelos - Tarde	Tarde	presencial	Ushuaia	2026	3	3	6	t	30	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
32	IF062-T-2025	Bases de Datos Distribuidas - Tarde	Tarde	presencial	Ushuaia	2026	3	3	6	t	31	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
33	IF063-T-2025	Seminario de Seguridad - Tarde	Tarde	presencial	Ushuaia	2026	2	2	4	t	32	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
34	IF026-T-2025	Tesina - Tarde	Tarde	presencial	Ushuaia	2026	0	0	0	t	36	2026-04-21 16:46:25	2026-04-21 16:46:25	1ro
35	IF027-T-2025	Modelos y Simulación - Tarde	Tarde	presencial	Ushuaia	2026	3	3	6	t	33	2026-04-21 16:46:25	2026-04-21 16:46:25	2do
36	IF042-T-2025	Proyecto de Software - Tarde	Tarde	presencial	Ushuaia	2026	4	4	8	t	34	2026-04-21 16:46:25	2026-04-21 16:46:25	2do
\.


--
-- Data for Name: coordinador_carreras; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.coordinador_carreras (id, user_id, carrera_id, created_at, updated_at) FROM stdin;
1	2	1	2026-04-21 16:46:58	2026-04-21 16:46:58
\.


--
-- Data for Name: dedicaciones; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.dedicaciones (id, nombre, horas_frente_aula_min, horas_frente_aula_max, nro_materias_max, created_at, updated_at) FROM stdin;
1	Simple	4	10	3	2026-04-21 16:46:25	2026-04-21 16:46:25
2	SemiExclusiva(DP)	8	16	4	2026-04-21 16:46:25	2026-04-21 16:46:25
3	SemiExclusiva(DI)	8	16	4	2026-04-21 16:46:25	2026-04-21 16:46:25
4	Exclusiva	12	20	5	2026-04-21 16:46:25	2026-04-21 16:46:25
\.


--
-- Data for Name: dictas; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.dictas (id, docente_id, cargo_id, comision_id, ano_inicio, "año_fin", funcion_aulica_id, modalidad_presencia, horas_frente_aula, created_at, updated_at) FROM stdin;
1	16	16	13	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
2	11	11	17	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
3	11	11	36	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
4	11	11	14	2026-03-01	\N	1	presencial	5	2026-04-21 16:46:25	2026-04-21 16:46:25
5	17	17	27	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
6	17	17	18	2026-03-01	\N	1	presencial	2	2026-04-21 16:46:25	2026-04-21 16:46:25
7	17	17	20	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
8	14	14	15	2026-03-01	\N	1	presencial	3	2026-04-21 16:46:25	2026-04-21 16:46:25
9	14	14	24	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
10	21	21	16	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
11	21	21	24	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
12	21	21	13	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
13	18	18	23	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
14	18	18	9	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
15	12	12	26	2026-03-01	\N	1	presencial	8	2026-04-21 16:46:25	2026-04-21 16:46:25
16	12	12	5	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
17	12	12	10	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
18	20	20	25	2026-03-01	\N	1	presencial	6	2026-04-21 16:46:25	2026-04-21 16:46:25
19	20	20	30	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
20	2	2	1	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
21	2	2	21	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
22	2	2	29	2026-03-01	\N	1	presencial	6	2026-04-21 16:46:25	2026-04-21 16:46:25
23	25	25	33	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
24	3	3	5	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
25	3	3	10	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
26	15	15	31	2026-03-01	\N	1	presencial	6	2026-04-21 16:46:25	2026-04-21 16:46:25
27	15	15	21	2026-03-01	\N	1	presencial	3	2026-04-21 16:46:25	2026-04-21 16:46:25
28	16	16	19	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
29	19	19	16	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
30	19	19	12	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
31	27	27	11	2026-03-01	\N	1	presencial	3	2026-04-21 16:46:25	2026-04-21 16:46:25
32	1	1	20	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
33	1	1	18	2026-03-01	\N	2	presencial	2	2026-04-21 16:46:25	2026-04-21 16:46:25
34	23	23	27	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
35	23	23	8	2026-03-01	\N	2	presencial	3	2026-04-21 16:46:25	2026-04-21 16:46:25
36	28	28	28	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
37	29	29	22	2026-03-01	\N	1	presencial	2	2026-04-21 16:46:25	2026-04-21 16:46:25
38	28	28	22	2026-03-01	\N	1	presencial	2	2026-04-21 16:46:25	2026-04-21 16:46:25
39	24	24	4	2026-03-01	\N	1	presencial	0	2026-04-21 16:46:25	2026-04-21 16:46:25
40	7	7	3	2026-03-01	\N	2	presencial	5	2026-04-21 16:46:25	2026-04-21 16:46:25
41	7	7	7	2026-03-01	\N	2	presencial	6	2026-04-21 16:46:25	2026-04-21 16:46:25
42	4	4	1	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
43	4	4	6	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
44	19	19	32	2026-03-01	\N	2	presencial	6	2026-04-21 16:46:25	2026-04-21 16:46:25
45	1	1	19	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
46	13	13	7	2026-03-01	\N	1	presencial	5	2026-04-21 16:46:25	2026-04-21 16:46:25
47	10	10	3	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
48	25	25	1	2026-03-01	\N	1	presencial	3	2026-04-21 16:46:25	2026-04-21 16:46:25
49	5	5	11	2026-03-01	\N	2	presencial	3	2026-04-21 16:46:25	2026-04-21 16:46:25
50	10	10	35	2026-03-01	\N	2	presencial	6	2026-04-21 16:46:25	2026-04-21 16:46:25
51	8	8	17	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
52	8	8	12	2026-03-01	\N	2	presencial	5	2026-04-21 16:46:25	2026-04-21 16:46:25
53	9	9	3	2026-03-01	\N	2	presencial	5	2026-04-21 16:46:25	2026-04-21 16:46:25
54	6	6	14	2026-03-01	\N	2	presencial	5	2026-04-21 16:46:25	2026-04-21 16:46:25
55	6	6	15	2026-03-01	\N	2	presencial	3	2026-04-21 16:46:25	2026-04-21 16:46:25
56	6	6	8	2026-03-01	\N	2	presencial	3	2026-04-21 16:46:25	2026-04-21 16:46:25
57	22	22	2	2026-03-01	\N	1	presencial	3	2026-04-21 16:46:25	2026-04-21 16:46:25
58	22	22	6	2026-03-01	\N	1	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
59	33	33	9	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
60	33	33	23	2026-03-01	\N	2	presencial	5	2026-04-21 16:46:25	2026-04-21 16:46:25
61	30	30	2	2026-03-01	\N	2	presencial	3	2026-04-21 16:46:25	2026-04-21 16:46:25
62	30	30	6	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
63	31	31	7	2026-03-01	\N	2	presencial	6	2026-04-21 16:46:25	2026-04-21 16:46:25
64	32	32	5	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
65	34	34	2	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
66	35	35	1	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
67	35	35	12	2026-03-01	\N	2	presencial	4	2026-04-21 16:46:25	2026-04-21 16:46:25
68	36	36	7	2026-03-01	\N	2	presencial	5	2026-04-21 16:46:25	2026-04-21 16:46:25
\.


--
-- Data for Name: docentes; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.docentes (id, legajo, nombre, apellido, "modalidad_desempeño", carga_horaria, es_activo, created_at, updated_at, telefono, email) FROM stdin;
1	761	Luis Miguel	Rojas Flores	Investigador	10	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
2	199	Lucila	Chiarvetto	Desarrollo	14	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
3	359	Antonio Luis	Retamar	Investigador	8	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
4	9017	Cristian Alejandro	Alvarez C.	Desarrollo	8	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
5	9002	Samanta	Dodino	Desarrollo	3	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
6	9021	Ivan	D'Uva	Desarrollo	11	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
7	1059	Natalia Yudit	Bravo	Investigador	11	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
8	9999	Fabiola	Horas Stevenson	Desarrollo	9	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
9	9020	Alejandro	Carhuas	Desarrollo	5	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
10	481	Antonio Héctor	Dell'Osa	Investigador	10	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
11	83	Jorge Ezequiel	Moyano	Investigador	13	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
12	129	Daniel	Aguil Mallea	Investigador	16	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
13	50	Fernando	Aras	Desarrollo	5	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
14	104	Matías	Gel	Investigador	7	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
15	406	Federico Eduardo	Gonzalez	Investigador	9	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
16	80	Ariel	Parson	Desarrollo	8	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
17	89	Horacio	Pendenti	Investigador	10	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
18	125	Guillermo	Prisching	Investigador	8	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
19	453	Nadia Patricia	Ramos	Investigador	14	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
20	172	Leonel	Viera	Investigador	10	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
21	124	Martín	Villarreal	Desarrollo	12	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
22	9022	Fernando	Temari	Desarrollo	7	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
23	902	Cintia Alejandra	Aguado	Desarrollo	7	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
24	9010	Silvina	Calomino	Desarrollo	0	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
25	271	Emilio	Izarra	Investigador	7	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
26	652	Sebastián	Juncos	Investigador	0	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
27	734	Erica	Schlaps	Desarrollo	3	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
28	929	Norma Graciela	Vecchi	Investigador	6	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
29	9000	Silvina	Romano	Investigador	2	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
30	9024	Agnela	Siles	Desarrollo	7	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
31	9025	Juan	Borchert	Desarrollo	6	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
32	9026	Nicolas	Sartori	Desarrollo	4	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
34	9030	Eric	Gassman	Desarrollo	4	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
35	9031	Alejandro	Alvarez A.	Desarrollo	8	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
36	9032	Pablo Matias	Jusim	Desarrollo	5	t	2026-04-21 16:46:25	2026-04-21 16:46:25	\N	\N
33	9023	Nicolas	Acevedo	Desarrollo	9	t	2026-04-21 16:46:25	2026-04-24 18:33:04	\N	\N
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: funciones_aulicas; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.funciones_aulicas (id, nombre, created_at, updated_at) FROM stdin;
1	Responsable de Cátedra	2026-04-21 16:46:25	2026-04-21 16:46:25
2	Auxiliar de Cátedra	2026-04-21 16:46:25	2026-04-21 16:46:25
3	Teórico	2026-04-21 16:46:25	2026-04-21 16:46:25
4	Práctico	2026-04-21 16:46:25	2026-04-21 16:46:25
5	Teórico-Práctico	2026-04-21 16:46:25	2026-04-21 16:46:25
\.


--
-- Data for Name: horarios; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.horarios (id, comision_id, dia_semana, hora_inicio, hora_fin, aula, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: institutos; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.institutos (id, nombre, siglas, created_at, updated_at) FROM stdin;
1	Instituto de Desarrollo Económico e Innovación	IDEI	2026-04-21 16:46:25	2026-04-21 16:46:25
2	Escuela de Desarrollo e Innovación	EDI	2026-04-21 16:46:25	2026-04-21 16:46:25
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- Data for Name: materias; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.materias (id, nombre, codigo, estado, regimen, cuatrimestre, horas_semanales, horas_totales, created_at, updated_at) FROM stdin;
1	Elementos de Informática	IF001	t	cuatrimestral	1	7	105	2026-04-21 16:46:25	2026-04-21 16:46:25
3	Algebra	MA045	t	cuatrimestral	1	9	135	2026-04-21 16:46:25	2026-04-21 16:46:25
4	Algorítmica y Programación I	IF003	t	cuatrimestral	2	8	120	2026-04-21 16:46:25	2026-04-21 16:46:25
5	Elementos de Lógica y Matemática Discreta	MA008	t	cuatrimestral	2	8	120	2026-04-21 16:46:25	2026-04-21 16:46:25
6	Análisis Matemático	MA046	t	cuatrimestral	2	11	165	2026-04-21 16:46:25	2026-04-21 16:46:25
7	Sistemas y Organizaciones	IF004	t	cuatrimestral	3	6	90	2026-04-21 16:46:25	2026-04-21 16:46:25
8	Arquitectura de Computadoras	IF005	t	cuatrimestral	3	8	120	2026-04-21 16:46:25	2026-04-21 16:46:25
9	Algorítmica y Programación II	IF006	t	cuatrimestral	3	8	120	2026-04-21 16:46:25	2026-04-21 16:46:25
10	Estadística	MA006	t	cuatrimestral	3	6	90	2026-04-21 16:46:25	2026-04-21 16:46:25
11	Bases de Datos I	IF007	t	cuatrimestral	4	9	135	2026-04-21 16:46:25	2026-04-21 16:46:25
12	Programación y Diseño Orientado a Objetos	IF030	t	cuatrimestral	4	8	120	2026-04-21 16:46:25	2026-04-21 16:46:25
13	Ingeniería de Software I	IF031	t	cuatrimestral	4	10	150	2026-04-21 16:46:25	2026-04-21 16:46:25
14	Laboratorio de Programación y Lenguajes	IF009	t	cuatrimestral	5	6	90	2026-04-21 16:46:25	2026-04-21 16:46:25
15	Fundamentos Teóricos de Informática	IF013	t	cuatrimestral	5	8	120	2026-04-21 16:46:25	2026-04-21 16:46:25
16	Ingeniería de Software II	IF033	t	cuatrimestral	5	8	120	2026-04-21 16:46:25	2026-04-21 16:46:25
17	Introducción a la Concurrencia	IF038	t	cuatrimestral	5	4	60	2026-04-21 16:46:25	2026-04-21 16:46:25
18	Bases de Datos II	IF044	t	cuatrimestral	6	8	120	2026-04-21 16:46:25	2026-04-21 16:46:25
19	Sistemas Operativos	IF037	t	cuatrimestral	6	8	120	2026-04-21 16:46:25	2026-04-21 16:46:25
20	Laboratorio de Software	IF055	t	cuatrimestral	6	7	105	2026-04-21 16:46:25	2026-04-21 16:46:25
21	Seminario de Aspectos Legales y Profesionales I	IF056	t	cuatrimestral	6	4	60	2026-04-21 16:46:25	2026-04-21 16:46:25
22	Redes y Transmisión de Datos	IF019	t	cuatrimestral	7	9	135	2026-04-21 16:46:25	2026-04-21 16:46:25
23	Paradigmas y Lenguajes de Programación	IF020	t	cuatrimestral	7	8	120	2026-04-21 16:46:25	2026-04-21 16:46:25
24	Taller de nuevas Tecnologías	IF017	t	cuatrimestral	7	6	90	2026-04-21 16:46:25	2026-04-21 16:46:25
25	Sistemas Distribuidos	IF022	t	cuatrimestral	8	8	120	2026-04-21 16:46:25	2026-04-21 16:46:25
26	Ingeniería de Software III	IF035	t	cuatrimestral	8	8	120	2026-04-21 16:46:25	2026-04-21 16:46:25
27	Seminario de Aspectos Legales y Profesionales II	IF057	t	cuatrimestral	8	4	60	2026-04-21 16:46:25	2026-04-21 16:46:25
28	Sistemas Inteligentes	IF059	t	cuatrimestral	8	6	90	2026-04-21 16:46:25	2026-04-21 16:46:25
29	Sistemas de Tiempo Real	IF060	t	cuatrimestral	9	7	105	2026-04-21 16:46:25	2026-04-21 16:46:25
30	Sistemas Paralelos	IF061	t	cuatrimestral	9	6	90	2026-04-21 16:46:25	2026-04-21 16:46:25
31	Bases de Datos Distribuidas	IF062	t	cuatrimestral	9	6	90	2026-04-21 16:46:25	2026-04-21 16:46:25
32	Seminario de Seguridad	IF063	t	cuatrimestral	9	4	60	2026-04-21 16:46:25	2026-04-21 16:46:25
33	Modelos y Simulación	IF027	t	cuatrimestral	10	6	90	2026-04-21 16:46:25	2026-04-21 16:46:25
34	Proyecto de Software	IF042	t	cuatrimestral	10	8	120	2026-04-21 16:46:25	2026-04-21 16:46:25
35	Acreditación de Idioma Inglés	FA007	t	cuatrimestral	1	0	0	2026-04-21 16:46:25	2026-04-21 16:46:25
36	Tesina	IF026	t	anual	10	0	200	2026-04-21 16:46:25	2026-04-21 16:46:25
2	Expresión de Problemas y Algoritmos	IF002	t	cuatrimestral	1	6	96	2026-04-21 16:46:25	2026-04-24 17:54:33
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2025_10_08_151543_create_personal_access_tokens_table	1
5	2025_10_08_152318_create_institutos_table	1
6	2025_10_08_152422_create_carreras_table	1
7	2025_10_08_152436_create_materias_table	1
8	2025_10_08_152450_create_plans_table	1
9	2025_10_08_154254_create_plan_materia_table	1
10	2025_10_08_155219_create_comisions_table	1
11	2025_10_19_202658_create_docentes_table	1
12	2025_10_19_205255_create_cargos_table	1
13	2025_10_20_000317_create_dictas_table	1
14	2025_10_20_145558_create_permission_tables	1
15	2025_10_20_151744_add_campos_user_y_tabla_pivot_coordinador_materias	1
16	2025_10_24_154205_add_restriccion_nombre_cargos	1
17	2025_10_27_181226_add_cuatrimestre_comision	1
18	2025_11_25_183957_alter_table_users_add_carreras	1
19	2026_03_24_015817_create_horarios_table	1
\.


--
-- Data for Name: model_has_permissions; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.model_has_permissions (permission_id, model_type, model_id) FROM stdin;
\.


--
-- Data for Name: model_has_roles; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.model_has_roles (role_id, model_type, model_id) FROM stdin;
1	App\\Models\\User	1
4	App\\Models\\User	2
5	App\\Models\\User	3
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.permissions (id, name, guard_name, created_at, updated_at) FROM stdin;
1	crear_usuario	web	2026-04-21 16:46:18	2026-04-21 16:46:18
2	consultar_usuario	web	2026-04-21 16:46:18	2026-04-21 16:46:18
3	modificar_usuario	web	2026-04-21 16:46:18	2026-04-21 16:46:18
4	restore_usuario	web	2026-04-21 16:46:18	2026-04-21 16:46:18
5	modificar_permisos	web	2026-04-21 16:46:18	2026-04-21 16:46:18
6	crear_carrera	web	2026-04-21 16:46:18	2026-04-21 16:46:18
7	consultar_carrera	web	2026-04-21 16:46:18	2026-04-21 16:46:18
8	modificar_carrera	web	2026-04-21 16:46:18	2026-04-21 16:46:18
9	restore_carrera	web	2026-04-21 16:46:18	2026-04-21 16:46:18
10	crear_docente	web	2026-04-21 16:46:18	2026-04-21 16:46:18
11	consultar_docente	web	2026-04-21 16:46:18	2026-04-21 16:46:18
12	modificar_docente	web	2026-04-21 16:46:18	2026-04-21 16:46:18
13	restore_docente	web	2026-04-21 16:46:18	2026-04-21 16:46:18
14	crear_materia	web	2026-04-21 16:46:18	2026-04-21 16:46:18
15	consultar_materia	web	2026-04-21 16:46:18	2026-04-21 16:46:18
16	modificar_materia	web	2026-04-21 16:46:18	2026-04-21 16:46:18
17	restore_materia	web	2026-04-21 16:46:18	2026-04-21 16:46:18
18	crear_comision	web	2026-04-21 16:46:18	2026-04-21 16:46:18
19	consultar_comision	web	2026-04-21 16:46:18	2026-04-21 16:46:18
20	modificar_comision	web	2026-04-21 16:46:18	2026-04-21 16:46:18
21	restore_comision	web	2026-04-21 16:46:18	2026-04-21 16:46:18
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: plan_materia; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.plan_materia (plan_id, materia_id) FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
1	7
1	8
1	9
1	10
1	11
1	12
1	13
1	14
1	15
1	16
1	17
1	18
1	19
1	20
1	21
1	22
1	23
1	24
1	25
1	26
1	27
1	28
1	29
1	30
1	31
1	32
1	33
1	34
1	35
1	36
\.


--
-- Data for Name: planes; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.planes (id, carrera_id, anio_comienzo, anio_fin, created_at, updated_at) FROM stdin;
1	1	2025-01-01	\N	2026-04-21 16:46:25	2026-04-21 16:46:25
\.


--
-- Data for Name: role_has_permissions; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.role_has_permissions (permission_id, role_id) FROM stdin;
1	1
2	1
3	1
4	1
5	1
6	1
7	1
8	1
9	1
10	1
11	1
12	1
13	1
14	1
15	1
16	1
17	1
18	1
19	1
20	1
21	1
2	2
3	2
4	2
5	2
6	2
7	2
8	2
9	2
10	2
11	2
12	2
13	2
14	2
15	2
16	2
17	2
18	2
19	2
20	2
21	2
6	3
7	3
8	3
10	3
11	3
12	3
14	3
15	3
16	3
18	3
19	3
20	3
7	4
8	4
15	4
16	4
11	4
18	4
19	4
20	4
7	5
11	5
15	5
19	5
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.roles (id, name, guard_name, created_at, updated_at) FROM stdin;
1	Admin	web	2026-04-21 16:46:18	2026-04-21 16:46:18
2	Admin_global	web	2026-04-21 16:46:18	2026-04-21 16:46:18
3	Admin_instituto	web	2026-04-21 16:46:19	2026-04-21 16:46:19
4	Coord_carrera	web	2026-04-21 16:46:19	2026-04-21 16:46:19
5	Consulta_instituto	web	2026-04-21 16:46:19	2026-04-21 16:46:19
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: laravel
--

COPY public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, dni, nombre, apellido, is_activo, cargo, instituto_id) FROM stdin;
1	admin	admin@domain.com	\N	$2y$12$U75i1o5Tzt1PoVnv7b4S..iVTDTYmm1Qf0URV44fM9Tbks3E3mnqu	\N	2026-04-21 16:46:19	2026-04-21 16:46:19	0	Administrador	Sistema	t	Administrador	\N
2	coordinador	coordinadorcarrera@domain.com	\N	$2y$12$q8q/XCs24swgMbAq7sZgoernlCEm8/jgIj1OpHn7tqPaLMoGBbUce	\N	2026-04-21 16:46:51	2026-04-21 16:46:51	123123123	coordinador	carrera	t	Coordinador de Carrera	1
3	consulta	consulta@domain.com	\N	$2y$12$VRicxywFo5BMdaANgFW1MuQjp/PgsToeM/CFNDJI1ytv.MMZDnP2.	\N	2026-04-24 13:59:21	2026-04-24 13:59:21	123123124	consulta	instituto	t	Consejero	1
\.


--
-- Name: cargos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.cargos_id_seq', 37, false);


--
-- Name: carreras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.carreras_id_seq', 2, false);


--
-- Name: comisiones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.comisiones_id_seq', 37, true);


--
-- Name: coordinador_carreras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.coordinador_carreras_id_seq', 1, true);


--
-- Name: dedicaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.dedicaciones_id_seq', 5, false);


--
-- Name: dictas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.dictas_id_seq', 69, false);


--
-- Name: docentes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.docentes_id_seq', 37, false);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: funciones_aulicas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.funciones_aulicas_id_seq', 6, false);


--
-- Name: horarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.horarios_id_seq', 1, false);


--
-- Name: institutos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.institutos_id_seq', 3, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: materias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.materias_id_seq', 37, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.migrations_id_seq', 19, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.permissions_id_seq', 21, true);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 1, false);


--
-- Name: planes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.planes_id_seq', 2, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.roles_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: laravel
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: cargos cargos_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.cargos
    ADD CONSTRAINT cargos_pkey PRIMARY KEY (id);


--
-- Name: carreras carreras_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.carreras
    ADD CONSTRAINT carreras_pkey PRIMARY KEY (id);


--
-- Name: comisiones comisiones_codigo_unique; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.comisiones
    ADD CONSTRAINT comisiones_codigo_unique UNIQUE (codigo);


--
-- Name: comisiones comisiones_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.comisiones
    ADD CONSTRAINT comisiones_pkey PRIMARY KEY (id);


--
-- Name: coordinador_carreras coordinador_carreras_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.coordinador_carreras
    ADD CONSTRAINT coordinador_carreras_pkey PRIMARY KEY (id);


--
-- Name: coordinador_carreras coordinador_carreras_user_id_carrera_id_unique; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.coordinador_carreras
    ADD CONSTRAINT coordinador_carreras_user_id_carrera_id_unique UNIQUE (user_id, carrera_id);


--
-- Name: dedicaciones dedicaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.dedicaciones
    ADD CONSTRAINT dedicaciones_pkey PRIMARY KEY (id);


--
-- Name: dictas dictas_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.dictas
    ADD CONSTRAINT dictas_pkey PRIMARY KEY (id);


--
-- Name: docentes docentes_email_unique; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.docentes
    ADD CONSTRAINT docentes_email_unique UNIQUE (email);


--
-- Name: docentes docentes_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.docentes
    ADD CONSTRAINT docentes_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: funciones_aulicas funciones_aulicas_nombre_unique; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.funciones_aulicas
    ADD CONSTRAINT funciones_aulicas_nombre_unique UNIQUE (nombre);


--
-- Name: funciones_aulicas funciones_aulicas_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.funciones_aulicas
    ADD CONSTRAINT funciones_aulicas_pkey PRIMARY KEY (id);


--
-- Name: horarios horarios_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_pkey PRIMARY KEY (id);


--
-- Name: institutos institutos_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.institutos
    ADD CONSTRAINT institutos_pkey PRIMARY KEY (id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: materias materias_codigo_unique; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.materias
    ADD CONSTRAINT materias_codigo_unique UNIQUE (codigo);


--
-- Name: materias materias_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.materias
    ADD CONSTRAINT materias_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: model_has_permissions model_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_pkey PRIMARY KEY (permission_id, model_id, model_type);


--
-- Name: model_has_roles model_has_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_pkey PRIMARY KEY (role_id, model_id, model_type);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: permissions permissions_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: plan_materia plan_materia_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.plan_materia
    ADD CONSTRAINT plan_materia_pkey PRIMARY KEY (plan_id, materia_id);


--
-- Name: planes planes_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.planes
    ADD CONSTRAINT planes_pkey PRIMARY KEY (id);


--
-- Name: role_has_permissions role_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_pkey PRIMARY KEY (permission_id, role_id);


--
-- Name: roles roles_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_dni_unique; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_dni_unique UNIQUE (dni);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: laravel
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: model_has_permissions_model_id_model_type_index; Type: INDEX; Schema: public; Owner: laravel
--

CREATE INDEX model_has_permissions_model_id_model_type_index ON public.model_has_permissions USING btree (model_id, model_type);


--
-- Name: model_has_roles_model_id_model_type_index; Type: INDEX; Schema: public; Owner: laravel
--

CREATE INDEX model_has_roles_model_id_model_type_index ON public.model_has_roles USING btree (model_id, model_type);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: laravel
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: laravel
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: laravel
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: laravel
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: cargos cargos_dedicacion_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.cargos
    ADD CONSTRAINT cargos_dedicacion_id_foreign FOREIGN KEY (dedicacion_id) REFERENCES public.dedicaciones(id) ON DELETE CASCADE;


--
-- Name: cargos cargos_docente_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.cargos
    ADD CONSTRAINT cargos_docente_id_foreign FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON DELETE CASCADE;


--
-- Name: carreras carreras_instituto_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.carreras
    ADD CONSTRAINT carreras_instituto_id_foreign FOREIGN KEY (instituto_id) REFERENCES public.institutos(id) ON DELETE CASCADE;


--
-- Name: comisiones comisiones_id_materia_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.comisiones
    ADD CONSTRAINT comisiones_id_materia_foreign FOREIGN KEY (id_materia) REFERENCES public.materias(id) ON DELETE CASCADE;


--
-- Name: coordinador_carreras coordinador_carreras_carrera_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.coordinador_carreras
    ADD CONSTRAINT coordinador_carreras_carrera_id_foreign FOREIGN KEY (carrera_id) REFERENCES public.carreras(id) ON DELETE CASCADE;


--
-- Name: coordinador_carreras coordinador_carreras_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.coordinador_carreras
    ADD CONSTRAINT coordinador_carreras_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dictas dictas_cargo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.dictas
    ADD CONSTRAINT dictas_cargo_id_foreign FOREIGN KEY (cargo_id) REFERENCES public.cargos(id) ON DELETE CASCADE;


--
-- Name: dictas dictas_comision_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.dictas
    ADD CONSTRAINT dictas_comision_id_foreign FOREIGN KEY (comision_id) REFERENCES public.comisiones(id) ON DELETE CASCADE;


--
-- Name: dictas dictas_docente_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.dictas
    ADD CONSTRAINT dictas_docente_id_foreign FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON DELETE CASCADE;


--
-- Name: dictas dictas_funcion_aulica_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.dictas
    ADD CONSTRAINT dictas_funcion_aulica_id_foreign FOREIGN KEY (funcion_aulica_id) REFERENCES public.funciones_aulicas(id) ON DELETE SET NULL;


--
-- Name: horarios horarios_comision_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_comision_id_foreign FOREIGN KEY (comision_id) REFERENCES public.comisiones(id) ON DELETE CASCADE;


--
-- Name: model_has_permissions model_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: model_has_roles model_has_roles_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: plan_materia plan_materia_materia_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.plan_materia
    ADD CONSTRAINT plan_materia_materia_id_foreign FOREIGN KEY (materia_id) REFERENCES public.materias(id) ON DELETE CASCADE;


--
-- Name: plan_materia plan_materia_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.plan_materia
    ADD CONSTRAINT plan_materia_plan_id_foreign FOREIGN KEY (plan_id) REFERENCES public.planes(id) ON DELETE CASCADE;


--
-- Name: planes planes_carrera_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.planes
    ADD CONSTRAINT planes_carrera_id_foreign FOREIGN KEY (carrera_id) REFERENCES public.carreras(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: users users_instituto_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: laravel
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_instituto_id_foreign FOREIGN KEY (instituto_id) REFERENCES public.institutos(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict UnGMiO5C3wXJ8KbRaAjYW002ikMFarRwR38KCWpJosfkKUd4Mi18MCFpwSeUCEG

