package com.hkhs.hmms.netwiser;

import java.text.SimpleDateFormat;
import java.util.Date;

import net.sf.ezmorph.object.DateMorpher;
import net.sf.json.JsonConfig;
import net.sf.json.processors.JsonValueProcessor;
import net.sf.json.util.JSONUtils;


public class DateJsonValueProcessor implements JsonValueProcessor {

	public static final String DEFAULT_DATE_PATTERN = "dd/MM/yyyy";
	public static final String DEFAULT_DATE_PATTERN2 = "yyyy-MM-dd";
	private SimpleDateFormat sdf;

	public DateJsonValueProcessor() {
		JSONUtils.getMorpherRegistry().registerMorpher(
				new DateMorpher(new String[] {DEFAULT_DATE_PATTERN}));
		sdf = new SimpleDateFormat(DEFAULT_DATE_PATTERN);
	}

	public DateJsonValueProcessor(String datePattern) {
		try {
			JSONUtils.getMorpherRegistry().registerMorpher(
					new DateMorpher(new String[] {datePattern}));
			sdf = new SimpleDateFormat(datePattern);
		} catch(RuntimeException e) {
			sdf = new SimpleDateFormat(DEFAULT_DATE_PATTERN);
		}
	}

	public Object processArrayValue(Object value, JsonConfig cfg) {
		return process(value);
	}

	public Object processObjectValue(String key, Object value, JsonConfig cfg) {
		return process(value);
	}

	private Object process(Object value) {
		if(value == null) {
			return null;
		}
		if(value instanceof Date) {
			return sdf.format(value);
		}
		return value.toString();
	}



}
