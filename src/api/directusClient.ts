import { createDirectus, rest, authentication } from "@directus/sdk";
import { DIRECTUS_URL } from '../config';

export const directus = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());