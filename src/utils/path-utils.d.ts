import { PathUtils } from '../types';
/**
 * Şablon bağlamına enjekte edilen dosya sistemi yardımcılarını üretir.
 *
 * @param filePath Şablon dosyası; 'inline' ise cwd temel alınır.
 * @param isPathAllowed rootPath güvenlik kontrolü (motor tarafından enjekte edilir).
 */
export declare function createPathUtils(filePath: string, isPathAllowed: (targetPath: string) => boolean): PathUtils;
//# sourceMappingURL=path-utils.d.ts.map