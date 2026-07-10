# Walkthrough: Database Scripts for Dynamic Menus

This document contains the complete set of PostgreSQL scripts required to implement the dynamic menu system. It includes table creation, the Stored Procedure (SP) for writing/updating, and the Stored Function (Fn) for reading.

---

## 1. Table Creation Commands

Run these queries to create the menu schema:

```sql
-- ── 1. Create Parent Menu Table ──
CREATE TABLE IF NOT EXISTS public.tbl_menu
(
    relation_id serial NOT NULL,
    org_id numeric(18,0),
    product_id bigint,
    role_id bigint,
    service_provider_id bigint,
    product_type bigint,
    menu_type bigint,
    module_name character varying(100),
    feature_id integer,
    feature_name character varying(200),
    feature_name_icon character varying(100),
    name text,
    link text,
    order_no numeric(18,0),
    icon text,
    link_description character varying(100),
    inactiveicon character varying(100),
    is_active boolean DEFAULT true,
    created_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(100),
    updated_on timestamp without time zone,
    updated_by character varying(100),
    is_docrequired boolean DEFAULT false,
    is_compliance boolean DEFAULT false,
    feature_seq bigint,
    login_role bigint,
    CONSTRAINT tbl_menu_pkey PRIMARY KEY (relation_id)
);

-- ── 2. Create Child Menu Table ──
CREATE TABLE IF NOT EXISTS public.gwtx_child_menu
(
    pkid serial NOT NULL,
    fkid_menuid bigint,
    parent_id bigint,
    route character varying(120),
    logourl text,
    servicename character varying(100),
    order_no bigint,
    section_id character varying(150),
    language character varying(50),
    key character varying(50),
    is_active boolean DEFAULT true,
    created_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(100),
    modified_on timestamp without time zone,
    modified_by character varying(100),
    CONSTRAINT gwtx_child_menu_pkey PRIMARY KEY (pkid)
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_child_menu_fk ON public.gwtx_child_menu (fkid_menuid ASC);
CREATE INDEX IF NOT EXISTS idx_child_menu_parent ON public.gwtx_child_menu (parent_id ASC);
```

---

## 2. Stored Procedure (SP): `dpdpa_pa_menu_mgmt`

This procedure handles all **Write** operations (Create, Update, Delete) for both tables. It uses a `target` payload attribute (`'parent'` or `'child'`) to route edits to the correct table.

```sql
CREATE OR REPLACE PROCEDURE public.dpdpa_pa_menu_mgmt(
    p_payload json,
    INOUT p_response json DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_action text;
    v_target text;  -- 'parent' or 'child'
    
    -- Common fields
    v_user character varying(100);
    v_is_active boolean;
    v_order_no numeric;
    
    -- Parent menu fields
    v_relation_id bigint;
    v_org_id numeric;
    v_name text;
    v_icon text;
    v_role_id bigint;
    v_login_role bigint;

    -- Child menu fields
    v_pkid bigint;
    v_fkid_menuid bigint;
    v_route text;
    v_servicename varchar(100);
BEGIN
    -- Extract action, target and audit fields
    v_action   := p_payload->>'action';
    v_target   := COALESCE(p_payload->>'target', 'parent');
    v_user     := COALESCE(p_payload->>'createdBy', p_payload->>'updatedBy', 'system');
    
    ----------------------------------------------------
    -- TARGET: PARENT MENU (tbl_menu)
    ----------------------------------------------------
    IF v_target = 'parent' THEN
        v_relation_id := (p_payload->>'relationId')::bigint;
        v_org_id      := (p_payload->>'orgId')::numeric;
        v_name        := p_payload->>'name';
        v_icon        := p_payload->>'icon';
        v_order_no    := (p_payload->>'orderNo')::numeric;
        v_role_id     := (p_payload->>'roleId')::bigint;
        v_login_role  := (p_payload->>'loginRole')::bigint;
        v_is_active   := (p_payload->>'isActive')::boolean;

        IF v_action = 'C' THEN
            INSERT INTO public.tbl_menu (
                org_id, name, icon, order_no, role_id, login_role, is_active, created_by, created_on
            ) VALUES (
                v_org_id, v_name, v_icon, v_order_no, v_role_id, v_login_role, COALESCE(v_is_active, true), v_user, CURRENT_TIMESTAMP
            ) RETURNING relation_id INTO v_relation_id;

            p_response := json_build_object(
                'responseCode', '00',
                'description', 'Parent menu item created successfully',
                'data', json_build_object('relationId', v_relation_id)
            );

        ELSISET v_action = 'U' THEN
            UPDATE public.tbl_menu
            SET org_id = COALESCE(v_org_id, org_id),
                name = COALESCE(v_name, name),
                icon = COALESCE(v_icon, icon),
                order_no = COALESCE(v_order_no, order_no),
                role_id = COALESCE(v_role_id, role_id),
                login_role = COALESCE(v_login_role, login_role),
                is_active = COALESCE(v_is_active, is_active),
                updated_by = v_user,
                updated_on = CURRENT_TIMESTAMP
            WHERE relation_id = v_relation_id;

            p_response := json_build_object(
                'responseCode', '00',
                'description', 'Parent menu item updated successfully'
            );

        ELSISET v_action = 'D' THEN
            UPDATE public.tbl_menu
            SET is_active = false,
                updated_by = v_user,
                updated_on = CURRENT_TIMESTAMP
            WHERE relation_id = v_relation_id;

            p_response := json_build_object(
                'responseCode', '00',
                'description', 'Parent menu item deactivated successfully'
            );
        ELSE
            p_response := json_build_object('responseCode', '2', 'description', 'Unsupported parent action');
        END IF;

    ----------------------------------------------------
    -- TARGET: CHILD MENU (gwtx_child_menu)
    ----------------------------------------------------
    ELSISET v_target = 'child' THEN
        v_pkid        := (p_payload->>'pkid')::bigint;
        v_fkid_menuid := (p_payload->>'fkidMenuid')::bigint;
        v_route       := p_payload->>'route';
        v_servicename := p_payload->>'servicename';
        v_order_no    := (p_payload->>'orderNo')::bigint;
        v_is_active   := (p_payload->>'isActive')::boolean;

        IF v_action = 'C' THEN
            INSERT INTO public.gwtx_child_menu (
                fkid_menuid, route, servicename, order_no, is_active, created_by, created_on
            ) VALUES (
                v_fkid_menuid, v_route, v_servicename, v_order_no, COALESCE(v_is_active, true), v_user, CURRENT_TIMESTAMP
            ) RETURNING pkid INTO v_pkid;

            p_response := json_build_object(
                'responseCode', '00',
                'description', 'Child menu item created successfully',
                'data', json_build_object('pkid', v_pkid)
            );

        ELSISET v_action = 'U' THEN
            UPDATE public.gwtx_child_menu
            SET fkid_menuid = COALESCE(v_fkid_menuid, fkid_menuid),
                route = COALESCE(v_route, route),
                servicename = COALESCE(v_servicename, servicename),
                order_no = COALESCE(v_order_no, order_no),
                is_active = COALESCE(v_is_active, is_active),
                modified_by = v_user,
                modified_on = CURRENT_TIMESTAMP
            WHERE pkid = v_pkid;

            p_response := json_build_object(
                'responseCode', '00',
                'description', 'Child menu item updated successfully'
            );

        ELSISET v_action = 'D' THEN
            UPDATE public.gwtx_child_menu
            SET is_active = false,
                modified_by = v_user,
                modified_on = CURRENT_TIMESTAMP
            WHERE pkid = v_pkid;

            p_response := json_build_object(
                'responseCode', '00',
                'description', 'Child menu item deactivated successfully'
            );
        ELSE
            p_response := json_build_object('responseCode', '2', 'description', 'Unsupported child action');
        END IF;

    ELSE
        p_response := json_build_object('responseCode', '2', 'description', 'Invalid target table type');
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        p_response := json_build_object(
            'responseCode', '2',
            'description', SQLERRM
        );
END;
$$;
```

---

## 3. Stored Function (Fn): `dpdpa_fn_menu_mgmt`

This function is invoked by the Angular app via `/generic/execute` to fetch the nested dynamic menu configuration.

```sql
CREATE OR REPLACE FUNCTION public.dpdpa_fn_menu_mgmt(p_payload json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_action text;
    v_org_id numeric;
    v_role_id bigint;
    v_response_data json;
    v_menu_data json;
BEGIN
    -- Extract values from JSON payload
    v_action := p_payload->>'action';
    v_org_id := (p_payload->>'orgId')::numeric;
    v_role_id := (p_payload->>'roleId')::bigint;

    IF v_action = 'SEARCH' THEN
        -- Query to fetch parent menus and their child menus aggregated as JSON
        SELECT json_agg(
            json_build_object(
                'relation_id', m.relation_id,
                'name', COALESCE(m.feature_name, m.name),
                'icon', COALESCE(m.feature_name_icon, m.icon, '📁'),
                'order_no', m.order_no,
                'items', COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'pkid', c.pkid,
                                'label', c.servicename,
                                'route', c.route,
                                'order_no', c.order_no
                            ) ORDER BY c.order_no ASC
                        )
                        FROM public.gwtx_child_menu c
                        WHERE c.fkid_menuid = m.relation_id AND c.is_active = true
                    ),
                    '[]'::json
                )
            ) ORDER BY m.order_no ASC
        )
        INTO v_menu_data
        FROM public.tbl_menu m
        WHERE m.is_active = true
          AND (v_org_id IS NULL OR m.org_id = v_org_id)
          AND (v_role_id IS NULL OR m.role_id = v_role_id OR m.login_role = v_role_id);

        -- Build standard API response
        v_response_data := json_build_object(
            'responseCode', '00',
            'respMessage', 'Menu data fetched successfully',
            'data', COALESCE(v_menu_data, '[]'::json)
        );
        
        RETURN v_response_data;
    ELSE
        RETURN json_build_object(
            'responseCode', '2',
            'respMessage', 'Invalid action'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'responseCode', '2',
            'respMessage', SQLERRM
        );
END;
$function$;
```
