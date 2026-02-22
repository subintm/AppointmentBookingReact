  export const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };


   export const getMinDate = () => {
      const today = new Date();
      today.setDate(today.getDate() + 1);
      return today.toISOString().split('T')[0];
    };
  
 