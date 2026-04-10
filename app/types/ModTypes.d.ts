interface ModInterface {
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
  download_pc: string | null;
  download_android: string | null;
  required_revision: boolean;
  comments: string | null;
}

interface ModResponseInterface {
  resource: ModInterface;
  info: InfoInterface;
}

interface ImagesInterface {
  id: number;
  mod_id: number;
  type: string;
  url: string;
  is_active: boolean;
}
