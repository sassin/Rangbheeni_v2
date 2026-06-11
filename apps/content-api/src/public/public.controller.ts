import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { PublicService } from "./public.service.js";

@Controller()
export class PublicController {
  constructor(private readonly service: PublicService) {}

  @Get("health")
  health() {
    return this.service.health();
  }

  @Get("public/home")
  home() {
    return this.service.home();
  }

  @Get("public/site-settings")
  siteSettings() {
    return this.service.siteSettings();
  }

  @Get("public/navigation")
  navigation() {
    return this.service.navigation();
  }

  @Get("public/pages/:key")
  page(@Param("key") key: string) {
    return this.service.page(key);
  }

  @Get("public/product-categories")
  categories() {
    return this.service.categories();
  }

  @Get("public/products")
  products(@Query("featured") featured?: string, @Query("limit") limit?: string) {
    return this.service.products({ featured: featured === "true", limit: limit ? Number(limit) : undefined });
  }

  @Get("public/products/:slug")
  product(@Param("slug") slug: string) {
    return this.service.product(slug);
  }

  @Get("public/events")
  events(@Query("featured") featured?: string, @Query("limit") limit?: string) {
    return this.service.events({ featured: featured === "true", limit: limit ? Number(limit) : undefined });
  }

  @Get("public/events/:slug")
  event(@Param("slug") slug: string) {
    return this.service.event(slug);
  }

  @Get("public/stories")
  stories(@Query("featured") featured?: string, @Query("limit") limit?: string) {
    return this.service.stories({ featured: featured === "true", limit: limit ? Number(limit) : undefined });
  }

  @Get("public/stories/:slug")
  story(@Param("slug") slug: string) {
    return this.service.story(slug);
  }

  @Get("public/announcement/active")
  announcement() {
    return this.service.activeAnnouncement();
  }
  @Post("public/newsletter/subscribe")
  subscribeNewsletter(@Body("email") email: string) {
    return this.service.subscribeNewsletter(email);
  }
}
