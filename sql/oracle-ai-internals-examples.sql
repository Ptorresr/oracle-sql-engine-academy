-- Oracle AI Database 26ai examples for study only.
-- Do not execute from GitHub Pages. Verify version, privileges, AI profile,
-- credentials, network ACLs and service availability in the target environment.

CREATE TABLE product_embeddings_demo (
  product_id NUMBER PRIMARY KEY,
  product_name VARCHAR2(100),
  embedding VECTOR(3, FLOAT32)
);

INSERT INTO product_embeddings_demo VALUES (
  1, 'Running Aero', '[0.88, 0.21, 0.72]'
);

SELECT product_id,
       product_name,
       VECTOR_DISTANCE(embedding, :query_embedding, COSINE) AS distance
FROM product_embeddings_demo
ORDER BY distance
FETCH FIRST :top_k ROWS ONLY;

-- Verify CREATE VECTOR INDEX syntax and supported parameters for your release.
CREATE VECTOR INDEX product_embedding_hnsw
ON product_embeddings_demo (embedding)
ORGANIZATION INMEMORY NEIGHBOR GRAPH
DISTANCE COSINE;

-- DBMS_HYBRID_VECTOR.SEARCH accepts a documented JSON request against a hybrid index.
-- Validate the JSON shape, index and release before use.
SELECT *
FROM DBMS_HYBRID_VECTOR.SEARCH(
  JSON('{"search_text":"zapatillas running Aero"}')
);

-- Select AI requires DBMS_CLOUD_AI, an AI profile and authorized configuration.
-- The academy intentionally does not include credentials or executable provider calls.
-- SELECT AI <profile_name> SHOWSQL 'What category sold most this quarter?';

-- DBMS_CLOUD_AI_AGENT availability varies by deployment, release and grants.
-- No agent, tool, profile or task is created by this static academy.
