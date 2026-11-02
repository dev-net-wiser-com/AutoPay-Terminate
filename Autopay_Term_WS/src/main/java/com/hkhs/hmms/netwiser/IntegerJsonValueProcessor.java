package com.hkhs.hmms.netwiser;

import net.sf.json.JsonConfig;
import net.sf.json.processors.JsonValueProcessor;


public class IntegerJsonValueProcessor implements JsonValueProcessor {

	public IntegerJsonValueProcessor() {
	}

	public Object processArrayValue(Object value, JsonConfig cfg) {
		return process(value);
	}

	public Object processObjectValue(String key, Object value, JsonConfig cfg) {
		return process(value);
	}

	private Object process(Object value) {
		if(value == null) {
			return "null";
		}
		return value.toString();
	}



}
