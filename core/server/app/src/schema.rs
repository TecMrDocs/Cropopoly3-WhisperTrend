// @generated automatically by Diesel CLI.

diesel::table! {
    admins (id) {
        id -> Int4,
        #[max_length = 50]
        email -> Varchar,
        #[max_length = 50]
        name -> Varchar,
        #[max_length = 50]
        last_name -> Varchar,
        #[max_length = 150]
        password -> Varchar,
    }
}

diesel::table! {
    resources (id) {
        id -> Int4,
        user_id -> Int4,
        #[max_length = 50]
        r_type -> Varchar,
        #[max_length = 50]
        name -> Varchar,
        #[max_length = 300]
        description -> Varchar,
        #[max_length = 300]
        related_words -> Varchar,
    }
}

diesel::table! {
    sales (id) {
        id -> Int4,
        resource_id -> Int4,
        month -> Int4,
        year -> Int4,
        units_sold -> Int4,
    }
}

diesel::table! {
    users (id) {
        id -> Int4,
        #[max_length = 50]
        email -> Varchar,
        #[max_length = 50]
        name -> Varchar,
        #[max_length = 50]
        last_name -> Varchar,
        #[max_length = 50]
        phone -> Varchar,
        #[max_length = 50]
        position -> Varchar,
        #[max_length = 150]
        password -> Varchar,
        #[max_length = 50]
        plan -> Varchar,
        #[max_length = 50]
        business_name -> Varchar,
        #[max_length = 50]
        industry -> Varchar,
        #[max_length = 50]
        company_size -> Varchar,
        #[max_length = 50]
        scope -> Varchar,
        #[max_length = 250]
        locations -> Varchar,
        #[max_length = 50]
        num_branches -> Varchar,
    }
}

diesel::joinable!(resources -> users (user_id));
diesel::joinable!(sales -> resources (resource_id));

diesel::allow_tables_to_appear_in_same_query!(
    admins,
    resources,
    sales,
    users,
);
