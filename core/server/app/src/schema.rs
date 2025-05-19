// @generated automatically by Diesel CLI.

diesel::table! {
    recurso (id) {
        id -> Int4,
        id_usuario -> Int4,
        #[max_length = 50]
        tipo -> Varchar,
        #[max_length = 50]
        nombre -> Varchar,
        #[max_length = 300]
        descripcion -> Varchar,
        #[max_length = 300]
        palabras_rel -> Varchar,
    }
}

diesel::table! {
    users (id) {
        id -> Int4,
        #[max_length = 50]
        email -> Varchar,
        #[max_length = 50]
        nombres -> Varchar,
        #[max_length = 50]
        apellidos -> Varchar,
        #[max_length = 50]
        telefono -> Varchar,
        #[max_length = 50]
        puesto -> Varchar,
        #[max_length = 150]
        contrasena -> Varchar,
        #[max_length = 50]
        plan -> Varchar,
        #[max_length = 50]
        razon_social -> Varchar,
        #[max_length = 50]
        sector -> Varchar,
        #[max_length = 50]
        tamano_empresa -> Varchar,
        #[max_length = 50]
        alcance -> Varchar,
        #[max_length = 250]
        localidades -> Varchar,
        #[max_length = 50]
        num_sucursales -> Varchar,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    recurso,
    users,
);
