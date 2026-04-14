interface ModInterfaceApi {
  id: number;
  name: string;
  description: string;
  slug: string;
  status: string;
  character: string;
  duration: string;
  is_c_rated: boolean;
  type: string;
  slug: string;
  images: ImagesInterface[];
  genres: GenderMods[];
  download_pc: string | null;
  download_android: string | null;
  required_revision: boolean;
  comments: string | null;
}

interface ModResponseInterface {
  resource: ModInterfaceApi;
  info: InfoInterface;
}

interface ImagesInterface {
  id: number;
  mod_id: number;
  type: string;
  url: string;
  is_active: boolean;
}

interface ModDBInterface {
  id: number;
  mod_id_api: number;
  name_folder: string;
  name: string;
  logo: string;
  main_image: string;
  path: string;
  created_at: string;
  is_custom: boolean;
  is_active: boolean;
}
