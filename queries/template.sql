--- simple insert
INSERT INTO {table} 
	VALUES ST_SetSRID(ST_Point({lon},{lat}),4326), {time}, {id}, {link}, {thumbnail}, {team}),
		   ST_SetSRID(ST_Point({lon},{lat}),4326), {time}, {id}, {link}, {thumbnail}, {team})

--- upsert
WITH n(the_geom, ig_created_time, ig_id, ig_link, ig_thumbnail, team_name) AS (
	VALUES ST_SetSRID(ST_Point({lon},{lat}),4326), {time}, {id}, {link}, {thumbnail}, {team})
),
upsert AS (
	UPDATE {table} o
	SET the_geom = n.the_geom
	FROM n WHERE o.ig_id = n.ig_id
	RETURNING o.ig_id
)
INSERT INTO {table} (the_geom, ig_created_time, ig_id, ig_link, ig_thumbnail, team_name)
SELECT * FROM n
WHERE n.ig_id NOT IN (
	SELECT ig_id FROM upsert
)
