-- Solo laboratorio: pedido 104 intencionalmente sin cliente existente.
CREATE TABLE clientes_lab (cliente_id NUMBER PRIMARY KEY, nombre VARCHAR2(50) NOT NULL);
CREATE TABLE pedidos_lab (pedido_id NUMBER PRIMARY KEY, cliente_id NUMBER, monto NUMBER(10,2));
INSERT INTO clientes_lab VALUES (1, 'Ana');
INSERT INTO clientes_lab VALUES (2, 'Luis');
INSERT INTO clientes_lab VALUES (3, 'María');
INSERT INTO pedidos_lab VALUES (101, 1, 1200);
INSERT INTO pedidos_lab VALUES (102, 1, 350);
INSERT INTO pedidos_lab VALUES (103, 2, 780);
INSERT INTO pedidos_lab VALUES (104, 4, 990);
CREATE TABLE empleados_lab (empleado_id NUMBER PRIMARY KEY, nombre VARCHAR2(50), jefe_id NUMBER);
INSERT INTO empleados_lab VALUES (1, 'Sofía', NULL);
INSERT INTO empleados_lab VALUES (2, 'Diego', 1);
INSERT INTO empleados_lab VALUES (3, 'Elena', 1);
COMMIT;
