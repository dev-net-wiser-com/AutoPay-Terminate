package com.hkhs.hmms.config;

import java.util.List;
import jakarta.xml.ws.Endpoint;
import javax.sql.DataSource;
import org.apache.cxf.Bus;
import org.apache.cxf.jaxws.EndpointImpl;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.env.Environment;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import com.hkhs.hmms.netwiser.DBConnection;
import com.hkhs.hmms.soap.AutopaySoapEndpoint;

@Configuration
public class SoapConfiguration {
    @Bean
    InitializingBean legacyBridge(DataSource dataSource, Environment environment) {
        return () -> {
            DBConnection.initialize(dataSource);
            com.hkhs.hmms.netwiser.Configuration.initialize(environment);
            com.hkhs.hmms.netwiser.Configuration.fileCharset();
        };
    }
    @Bean
    @org.springframework.context.annotation.DependsOn("legacyBridge")
    Endpoint autopayEndpoint(Bus bus) {
        return publish(bus, new AutopaySoapEndpoint(), "/AutopayTermService");
    }
    @Bean
    @org.springframework.context.annotation.DependsOn("legacyBridge")
    Endpoint autopayAliasEndpoint(Bus bus) {
        return publish(bus, new AutopaySoapEndpoint(), "/AutopayTermService.AutopayTermServiceHttpSoap11Endpoint");
    }
    private Endpoint publish(Bus bus, Object service, String address) {
        EndpointImpl endpoint = new EndpointImpl(bus, service);
        endpoint.publish(address);
        return endpoint;
    }
    @Bean
    FilterRegistrationBean<CorsFilter> soapCors(Environment environment) {
        CorsConfiguration cors = new CorsConfiguration();
        String origins = environment.getProperty("autopay.cors-origins", "");
        if (!origins.isBlank()) {
            cors.setAllowedOrigins(List.of(origins.split("\\s*,\\s*")));
        }
        cors.setAllowedMethods(List.of("POST", "GET", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Content-Type", "SOAP", "SOAPAction", "Accept"));
        cors.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/services/**", cors);
        FilterRegistrationBean<CorsFilter> registration = new FilterRegistrationBean<>(new CorsFilter(source));
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        registration.addUrlPatterns("/services/*");
        return registration;
    }
}
