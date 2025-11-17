import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface InputField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'array';
  defaultValue: string;
  placeholder?: string;
  validation?: (value: string) => boolean;
  errorMessage?: string;
}

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
  title: string;
  fields: InputField[];
}

function InputModal({ isOpen, onClose, onSubmit, title, fields }: InputModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初始化默认值
  useEffect(() => {
    if (isOpen) {
      const initialValues: Record<string, string> = {};
      fields.forEach(field => {
        initialValues[field.name] = field.defaultValue;
      });
      setValues(initialValues);
      setErrors({});
    }
  }, [isOpen, fields]);

  const handleChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const value = values[field.name] || '';
      
      // 检查是否为空
      if (value.trim() === '') {
        newErrors[field.name] = `${field.label}不能为空`;
        isValid = false;
        return;
      }

      // 自定义验证
      if (field.validation && !field.validation(value)) {
        newErrors[field.name] = field.errorMessage || `${field.label}格式不正确`;
        isValid = false;
        return;
      }

      // 数组类型验证
      if (field.type === 'array') {
        const arr = value.split(',').map(n => n.trim());
        if (!arr.every(n => !isNaN(Number(n)))) {
          newErrors[field.name] = '请输入有效的数字数组（用逗号分隔）';
          isValid = false;
        }
      }

      // 数字类型验证
      if (field.type === 'number') {
        if (isNaN(Number(value))) {
          newErrors[field.name] = '请输入有效的数字';
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFields()) {
      return;
    }

    // 转换值
    const parsedValues: Record<string, any> = {};
    fields.forEach(field => {
      const value = values[field.name];
      if (field.type === 'array') {
        parsedValues[field.name] = value.split(',').map(n => Number(n.trim()));
      } else if (field.type === 'number') {
        parsedValues[field.name] = Number(value);
      } else {
        parsedValues[field.name] = value;
      }
    });

    onSubmit(parsedValues);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* 模态框 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
              {/* 头部 */}
              <div className="bg-gradient-to-r from-primary-500 to-blue-500 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* 表单内容 */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                {fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={values[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder || `请输入${field.label}`}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition font-mono ${
                        errors[field.name]
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                      }`}
                    />
                    {errors[field.name] && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                      >
                        <span>⚠️</span>
                        {errors[field.name]}
                      </motion.p>
                    )}
                    {field.type === 'array' && !errors[field.name] && (
                      <p className="mt-1 text-xs text-gray-500">
                        💡 提示：用逗号分隔数字，例如：1,2,3,4,5
                      </p>
                    )}
                  </div>
                ))}

                {/* 按钮组 */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
                  >
                    确定
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default InputModal;
