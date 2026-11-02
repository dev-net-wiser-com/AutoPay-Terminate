package com.hkhs.hmms.netwiser;
import net.sf.json.JSONArray;
import net.sf.json.JsonConfig;

import net.sf.json.util.CycleDetectionStrategy;
import java.util.Date;




public class JsonUtils {

	public static JsonConfig getJsonConfig() {
		JsonConfig cfg = new JsonConfig();
		cfg.setCycleDetectionStrategy(CycleDetectionStrategy.LENIENT);
		cfg.registerJsonValueProcessor(Date.class, new DateJsonValueProcessor());
		cfg.registerJsonValueProcessor(Integer.class, new IntegerJsonValueProcessor());
		return cfg;
	}


	public static JSONArray toJsonArray(Object list) {
		JsonConfig cfg = getJsonConfig();
		return JSONArray.fromObject(list, cfg);
	}

}
