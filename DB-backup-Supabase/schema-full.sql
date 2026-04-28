Dumping schemas from remote database...



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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."account" (
    "id" "text" NOT NULL,
    "accountId" "text" NOT NULL,
    "providerId" "text" NOT NULL,
    "userId" "text" NOT NULL,
    "accessToken" "text",
    "refreshToken" "text",
    "idToken" "text",
    "accessTokenExpiresAt" "date",
    "refreshTokenExpiresAt" "date",
    "scope" "text",
    "password" "text",
    "createdAt" "date" NOT NULL,
    "updatedAt" "date" NOT NULL
);


ALTER TABLE "public"."account" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "better_auth_user_id" "text" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "participant_id" "text",
    "type" "text",
    "message" "text",
    "resolved" boolean DEFAULT false,
    "session_id" "uuid",
    "receiver_id" "text"
);


ALTER TABLE "public"."alerts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."announcements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "party_id" "text",
    "content" "text" NOT NULL,
    "type" "text" DEFAULT 'info'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."announcements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "sender_id" "text",
    "receiver_id" "text",
    "session_id" "uuid",
    "weight" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."interactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "sender_id" "text",
    "receiver_id" "text",
    "content" "text",
    "is_read" boolean DEFAULT false
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nickname_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "participant_id" "text",
    "old_nickname" "text",
    "new_nickname" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."nickname_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."participants" (
    "id" "text" DEFAULT "gen_random_uuid"() NOT NULL,
    "nickname" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_active" timestamp with time zone DEFAULT "now"(),
    "session_id" "uuid",
    "anonymous_id" "text",
    "nickname_change_count" integer DEFAULT 0,
    "is_first_applied" boolean DEFAULT false,
    "is_second_applied" boolean DEFAULT false,
    "cupid_count" integer DEFAULT 2,
    "like_count" integer DEFAULT 3
);


ALTER TABLE "public"."participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."parties" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "start_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "end_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "max_participants" integer DEFAULT 0 NOT NULL,
    "qr_anchor_url" "text",
    "initial_hearts" integer DEFAULT 3 NOT NULL,
    "initial_cupids" integer DEFAULT 2 NOT NULL,
    "preset_type" "text" DEFAULT 'general'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."parties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."party_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'READY'::"text",
    "participant_limit" integer DEFAULT 100,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."party_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."session" (
    "id" "text" NOT NULL,
    "expiresAt" "date" NOT NULL,
    "token" "text" NOT NULL,
    "createdAt" "date" NOT NULL,
    "updatedAt" "date" NOT NULL,
    "ipAddress" "text",
    "userAgent" "text",
    "userId" "text" NOT NULL
);


ALTER TABLE "public"."session" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_settings" (
    "key" "text" NOT NULL,
    "value" "jsonb" DEFAULT '{}'::"jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."system_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "emailVerified" integer NOT NULL,
    "image" "text",
    "createdAt" "date" NOT NULL,
    "updatedAt" "date" NOT NULL
);


ALTER TABLE "public"."user" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."verification" (
    "id" "text" NOT NULL,
    "identifier" "text" NOT NULL,
    "value" "text" NOT NULL,
    "expiresAt" "date" NOT NULL,
    "createdAt" "date" NOT NULL,
    "updatedAt" "date" NOT NULL
);


ALTER TABLE "public"."verification" OWNER TO "postgres";


ALTER TABLE ONLY "public"."account"
    ADD CONSTRAINT "account_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_better_auth_user_id_key" UNIQUE ("better_auth_user_id");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."alerts"
    ADD CONSTRAINT "alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interactions"
    ADD CONSTRAINT "interactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nickname_history"
    ADD CONSTRAINT "nickname_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."participants"
    ADD CONSTRAINT "participants_anonymous_id_key" UNIQUE ("anonymous_id");



ALTER TABLE ONLY "public"."participants"
    ADD CONSTRAINT "participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."parties"
    ADD CONSTRAINT "parties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."party_sessions"
    ADD CONSTRAINT "party_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session"
    ADD CONSTRAINT "session_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session"
    ADD CONSTRAINT "session_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."verification"
    ADD CONSTRAINT "verification_pkey" PRIMARY KEY ("id");



CREATE INDEX "account_userId_idx" ON "public"."account" USING "btree" ("userId");



CREATE INDEX "session_userId_idx" ON "public"."session" USING "btree" ("userId");



CREATE INDEX "verification_identifier_idx" ON "public"."verification" USING "btree" ("identifier");



ALTER TABLE ONLY "public"."account"
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."alerts"
    ADD CONSTRAINT "alerts_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."participants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."alerts"
    ADD CONSTRAINT "alerts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."party_sessions"("id");



ALTER TABLE ONLY "public"."interactions"
    ADD CONSTRAINT "interactions_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."participants"("id");



ALTER TABLE ONLY "public"."interactions"
    ADD CONSTRAINT "interactions_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."participants"("id");



ALTER TABLE ONLY "public"."interactions"
    ADD CONSTRAINT "interactions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."party_sessions"("id");



ALTER TABLE ONLY "public"."nickname_history"
    ADD CONSTRAINT "nickname_history_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."participants"
    ADD CONSTRAINT "participants_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."party_sessions"("id");



ALTER TABLE ONLY "public"."session"
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE;



CREATE POLICY "Allow admin to delete alerts" ON "public"."alerts" FOR DELETE USING (((("current_setting"('request.headers'::"text"))::"jsonb" ->> 'x-admin-user-id'::"text") IN ( SELECT "admin_users"."better_auth_user_id"
   FROM "public"."admin_users")));



CREATE POLICY "Allow admin to insert alerts" ON "public"."alerts" FOR INSERT WITH CHECK (((("current_setting"('request.headers'::"text"))::"jsonb" ->> 'x-admin-user-id'::"text") IN ( SELECT "admin_users"."better_auth_user_id"
   FROM "public"."admin_users")));



CREATE POLICY "Allow admin to update alerts" ON "public"."alerts" FOR UPDATE USING (((("current_setting"('request.headers'::"text"))::"jsonb" ->> 'x-admin-user-id'::"text") IN ( SELECT "admin_users"."better_auth_user_id"
   FROM "public"."admin_users"))) WITH CHECK (((("current_setting"('request.headers'::"text"))::"jsonb" ->> 'x-admin-user-id'::"text") IN ( SELECT "admin_users"."better_auth_user_id"
   FROM "public"."admin_users")));



CREATE POLICY "Allow all for anon" ON "public"."announcements" TO "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all for anon" ON "public"."nickname_history" TO "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all for anon" ON "public"."parties" TO "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all for authenticated" ON "public"."announcements" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all for authenticated" ON "public"."nickname_history" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all for authenticated" ON "public"."parties" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow anyone to read alerts" ON "public"."alerts" FOR SELECT USING (true);



CREATE POLICY "Allow full access to authenticated" ON "public"."party_sessions" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."alerts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."announcements" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "anon_insert_alerts" ON "public"."alerts" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "anon_insert_interactions" ON "public"."interactions" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "anon_insert_messages" ON "public"."messages" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "anon_read_alerts" ON "public"."alerts" FOR SELECT TO "anon" USING (true);



CREATE POLICY "anon_read_messages" ON "public"."messages" FOR SELECT TO "anon" USING (true);



CREATE POLICY "anon_read_participants" ON "public"."participants" FOR SELECT TO "anon" USING (true);



CREATE POLICY "anon_select_sessions" ON "public"."party_sessions" FOR SELECT TO "anon" USING (true);



CREATE POLICY "anon_select_system_settings" ON "public"."system_settings" FOR SELECT TO "anon" USING (true);



CREATE POLICY "anon_update_participants" ON "public"."participants" FOR UPDATE TO "anon" USING (true) WITH CHECK (true);



CREATE POLICY "auth_full_access_alerts" ON "public"."alerts" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "auth_full_access_messages" ON "public"."messages" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "auth_full_access_participants" ON "public"."participants" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."nickname_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."parties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."party_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_settings" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."alerts";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."announcements";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."interactions";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."participants";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."party_sessions";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





































































































































































GRANT ALL ON TABLE "public"."account" TO "anon";
GRANT ALL ON TABLE "public"."account" TO "authenticated";
GRANT ALL ON TABLE "public"."account" TO "service_role";



GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."alerts" TO "anon";
GRANT ALL ON TABLE "public"."alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."alerts" TO "service_role";



GRANT ALL ON TABLE "public"."announcements" TO "anon";
GRANT ALL ON TABLE "public"."announcements" TO "authenticated";
GRANT ALL ON TABLE "public"."announcements" TO "service_role";



GRANT ALL ON TABLE "public"."interactions" TO "anon";
GRANT ALL ON TABLE "public"."interactions" TO "authenticated";
GRANT ALL ON TABLE "public"."interactions" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."nickname_history" TO "anon";
GRANT ALL ON TABLE "public"."nickname_history" TO "authenticated";
GRANT ALL ON TABLE "public"."nickname_history" TO "service_role";



GRANT ALL ON TABLE "public"."participants" TO "anon";
GRANT ALL ON TABLE "public"."participants" TO "authenticated";
GRANT ALL ON TABLE "public"."participants" TO "service_role";



GRANT ALL ON TABLE "public"."parties" TO "anon";
GRANT ALL ON TABLE "public"."parties" TO "authenticated";
GRANT ALL ON TABLE "public"."parties" TO "service_role";



GRANT ALL ON TABLE "public"."party_sessions" TO "anon";
GRANT ALL ON TABLE "public"."party_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."party_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."session" TO "anon";
GRANT ALL ON TABLE "public"."session" TO "authenticated";
GRANT ALL ON TABLE "public"."session" TO "service_role";



GRANT ALL ON TABLE "public"."system_settings" TO "anon";
GRANT ALL ON TABLE "public"."system_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."system_settings" TO "service_role";



GRANT ALL ON TABLE "public"."user" TO "anon";
GRANT ALL ON TABLE "public"."user" TO "authenticated";
GRANT ALL ON TABLE "public"."user" TO "service_role";



GRANT ALL ON TABLE "public"."verification" TO "anon";
GRANT ALL ON TABLE "public"."verification" TO "authenticated";
GRANT ALL ON TABLE "public"."verification" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































A new version of Supabase CLI is available: v2.95.4 (currently installed v2.90.0)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
